from openai import OpenAI
import os
from typing import List

from .models import DocumentChunk, Document, DocumentStatus
from .services import RAGFileProcessService
from .embedding_model import EmbeddingModel


def run_rag_processing_pipeline_task(
    filepath: str,
    llm_model_name: str,
    llm_model_url: str,
    llm_model_api_key: str,
    source_document_id: int,
):
    """Main orchestrator task"""
    source_document: Document = Document.objects.get(id=source_document_id)
    _update_document_status(source_document, DocumentStatus.PROCESSING)
    
    try:
        llm_client = OpenAI(base_url=llm_model_url, api_key=llm_model_api_key)
        embed_model = EmbeddingModel.get_embed_model()
        
        semantic_chunks = _process_document_to_chunks(filepath, llm_client, llm_model_name)
        
        _embed_and_save_chunks(semantic_chunks, embed_model, source_document)
    except Exception as e:
        _handle_document_failure(source_document, str(e))
        raise e
    else:
        _update_document_status(source_document, DocumentStatus.SUCCESS)
    finally:
        _cleanup_file(filepath)


# ==========================================
# Extracted Helper Functions for Testing
# ==========================================

def _process_document_to_chunks(filepath: str, llm_client: OpenAI, llm_model_name: str) -> List[str]:
    """
    Handles Phase 1 & 2. 
    Highly testable: Just pass a mock OpenAI client and a dummy file path.
    """
    raw_content = RAGFileProcessService.read_pdf(filepath)
    structure_chunks = RAGFileProcessService.phase1_structure_chunking(raw_content)
    
    semantic_chunks = []
    for chunk in structure_chunks:
        semantic_chunks.extend(
            RAGFileProcessService.phase2_llm_semantic_chunking(llm_client, llm_model_name, chunk)
        )
    return semantic_chunks


def _embed_and_save_chunks(semantic_chunks: List[str], embed_model, source_document: Document):
    """
    Handles embedding generation and bulk DB operations.
    Testable by passing mock embeddings and checking if bulk_create was called correctly.
    """
    final_chunks = [
        DocumentChunk(
            content=chunk, 
            embedding=RAGFileProcessService.generate_embedding(embed_model, chunk),
            source_document=source_document,
        )
        for chunk in semantic_chunks
    ]
    DocumentChunk.objects.bulk_create(final_chunks)


def _update_document_status(document: Document, status: DocumentStatus):
    """database status updates."""
    document.status = status
    document.save(update_fields=['status'])


def _handle_document_failure(document: Document, error_message: str):
    """database error logging."""
    document.status = DocumentStatus.FAILED
    document.error_message = error_message
    document.save(update_fields=['status', 'error_message'])


def _cleanup_file(filepath: str):
    """Isolates file system cleanup."""
    if os.path.exists(filepath):
        os.remove(filepath)