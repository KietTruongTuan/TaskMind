# import modules
from sentence_transformers import SentenceTransformer
import pymupdf4llm
from openai import OpenAI
import json
import re
from typing import List
from enum import Enum
import logging

from django.conf import settings
from django.db.models import Q
from pgvector.django import CosineDistance

from .embedding_model import EmbeddingModel
from .models import DocumentChunk, DocumentStatus
from apps.accounts.models import User

logger = logging.getLogger(__name__)

CHUNK_MAX_SIZE = settings.CHUNK_MAX_SIZE
CHUNK_OVERLAP = settings.CHUNK_OVERLAP

class SplitLevel(Enum):
    SENTENCES = 1
    WORDS = 2
    FIXED_CHUNKS = 3

class RAGFileProcessService:
    """set of methods for rag processing of user uploaded document"""
    @staticmethod
    def read_pdf(file_path: str) -> str:
        """Read + convert the provided pdf file into text in markdown format"""
        raw_markdown = pymupdf4llm.to_markdown(file_path)
        # all pictures are being omitted, so remove image placeholders produced by pymupdf4llm
        pattern = r'\*\*==> picture \[.*?\] intentionally omitted <==\*\*\n*'
        clean_markdown = re.sub(pattern, "", raw_markdown)
        return clean_markdown

    @staticmethod
    def _structure_split_oversized(oversized_text: str, split_size: int = int(CHUNK_MAX_SIZE / 2), split_into: SplitLevel | None = None) -> List[str]:
        """Handle edge cases where we have a too long paragraphs, too long sentences,
        and even, too long words. Attempt to split the oversized text into sentences and words. 
        If a word is too long, resort to hard split
        Args:
            oversized_text (str): The edge case oversized text
            split_into (str, optional): optional setting on how oversized_text should be splitted. Possible values are ['sentences', 'words']. if left empty, default to hard split
        """
        if split_size > CHUNK_MAX_SIZE:
            raise ValueError(f'Split size ({split_size}) exceed maximum chunk size ({CHUNK_MAX_SIZE})')
        
        if split_into is SplitLevel.SENTENCES:
            # split into sentences using end-sentence punctuations
            parts = re.split(r'[?!.]', oversized_text.strip())
            next_level = SplitLevel.WORDS
            join_char = '. '
        elif split_into is SplitLevel.WORDS:
            # split into words
            parts = oversized_text.strip().split()
            next_level = SplitLevel.FIXED_CHUNKS
            join_char = ' '
        elif split_into is SplitLevel.FIXED_CHUNKS:
            # base case: hard split by chunk size
            return [oversized_text[i:i + split_size] for i in range(0, len(oversized_text), split_size)]
        else: 
            return []
            
        splitted_parts: List[str] = []
        current_part: List[str] = []
        current_part_length: int = 0
        for part in parts:
            if len(part) > split_size:
                # current level wont fit, recursively call to deeper level
                if current_part:
                    # if already accumulated some parts before the oversized part, save the current part
                    splitted_parts.append(join_char.join(current_part).strip())
                    current_part = []
                    current_part_length = 0
                    
                # recurse to deeper level to split the oversized part
                deeper_splitted_parts = RAGFileProcessService._structure_split_oversized(oversized_text=part, split_into=next_level)
                
                # extend the current parts with deeper splitted parts
                splitted_parts.extend(deeper_splitted_parts)
            elif current_part_length + len(part) + len(join_char) < split_size:
                # if adding this part wont exceed chunk limit, then add it
                current_part.append(part)
                current_part_length += len(part) + len(join_char)
            else:
                # limit reached, save current part then start new one
                splitted_parts.append(join_char.join(current_part).strip())
                current_part = [part]
                current_part_length = len(part)
        
        if current_part:
            # save the remaining parts
            splitted_parts.append(join_char.join(current_part).strip())
        
        return splitted_parts

    @staticmethod
    def phase1_structure_chunking(raw_text: str):
        """simple chunking into chunks of paragraph(s)
        a chunk will contain as many paragraphs as possible without exceeding the @chunk_max_size value
        """
        
        paragraphs: List[str] = [p for p in raw_text.split("\n\n") if p.strip()]
        
        # ensure all parts must fit into the limited chunk size
        safe_paragraphs: List[str] = []
        for p in paragraphs:
            if len(p) > CHUNK_MAX_SIZE:
                safe_paragraphs.extend(RAGFileProcessService._structure_split_oversized(
                    p,
                    int(CHUNK_MAX_SIZE / 2),
                    SplitLevel.SENTENCES
                ))
            else:
                safe_paragraphs.append(p)
        
        phase1_chunks: List[str] = []
        current_chunk: List[str] = []
        current_chunk_length: int = 0
        
        for p in safe_paragraphs:
            if current_chunk_length + len(p) < CHUNK_MAX_SIZE:
                # if adding paragraph p does not exceed the max chunk size, then add it
                current_chunk.append(p)
                current_chunk_length += len(p) + 2  # 2 for paragraph separator '\n\n\'
            else:
                # limit reached, save the current chunk
                # in the very first time the chunk is empty, so skip it 
                if current_chunk:
                    phase1_chunks.append('\n\n'.join(current_chunk).strip())
                
                # create overlap between chunks
                overlap_slice: List[str] = []
                if CHUNK_OVERLAP > 0 and (len(current_chunk) > CHUNK_OVERLAP):
                    overlap_slice = current_chunk[-CHUNK_OVERLAP:]
                else: 
                    overlap_slice = []
                    
                # start a new chunk
                current_chunk = overlap_slice + [p]
                current_chunk_length = sum([len(parag) + 2 for parag in current_chunk])
        
        # last remaining paragraphs
        if current_chunk:
            phase1_chunks.append("\n\n".join(current_chunk).strip())
        return phase1_chunks
    
    @staticmethod
    def phase2_llm_semantic_chunking(llm_client: OpenAI, llm_model: str, phase1_chunk: str):
        prompt = f"""You are an expert data processor building a knowledge base.
Analyze the following text block. Break it down into smaller, standalone, 
semantically complete chunks. Each chunk should contain a complete thought or concept.

Rules:
1. Resolve pronouns (e.g., replace "it" with the actual noun it refers to).
2. Do not change the underlying meaning.
3. Return ONLY a valid JSON array of strings. No markdown, no introductory text.

Text block:
{phase1_chunk}"""
        
        response: str = llm_client.chat.completions.create(
            model=llm_model,
            messages=[{'role': 'user', 'content': prompt}],
            temperature=0.1
        )
        
        # parse the LLM response
        try:
            semantic_chunks = json.loads(response.choices[0].message.content)
            return semantic_chunks
        except json.JSONDecodeError as e:
            print(f"\033[1;31;40m[ERROR]\033[0m Error parsing LLM response: {e}")
            # return [phase1_chunk]
            raise e
        
    @staticmethod
    def generate_embedding(embedding_model: SentenceTransformer, chunk: str) -> List:
        return embedding_model.encode(chunk).tolist()
    
    
class RAGContextService:
    """Provide context for task prompt from knowledge base"""
    
    @staticmethod
    def context_query_wrapper(name: str, description: str, top_k: int, user: User | None = None) -> List[str]:
        def context_query(name: str, description: str, top_k: int, user: User | None = None) -> List[str]:
            """Get top k most related chunks from knowledge base"""
            query_text = '. '.join([name, description])
            embed_model = EmbeddingModel.get_embed_model()
            query_embed = RAGFileProcessService.generate_embedding(embed_model, query_text)
            
            logger.info(f"Calling user instance: {user}")
            
            # only get context from user's document or built-in ones
            security_filter = (Q(source_document__user=user.id) | Q(source_document__user__isnull=True)) if user else Q(source_document__user__isnull=True)
            relevant_chunks: List[DocumentChunk] = list(
                DocumentChunk.objects.filter(security_filter).order_by(
                    CosineDistance('embedding', query_embed)
                )[:top_k]
            )
            
            return [str(chunk.content) for chunk in relevant_chunks]
        
        relevant_context = ""
        if getattr(settings, "ENABLE_GOAL_RAG_CONTEXT", True):
            try:
                relevant_context = (
                    context_query(name, description, top_k, user) or []
                )
            except Exception as e:
                logger.warning(
                    "Failed to retrieve RAG context for goal generation: %s",
                    str(e),
                    exc_info=True,
                )
        return relevant_context