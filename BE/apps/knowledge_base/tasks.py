import openai
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
        raise
    else:
        _update_document_status(source_document, DocumentStatus.SUCCESS)
    finally:
        _cleanup_file(filepath)


# ==========================================
# Extracted Helper Functions for Testing
# ==========================================

def _generate_document_context(llm_client: OpenAI, llm_model_name: str, raw_content: str) -> str | None:
    """
    Ask the LLM to produce a concise, 3–5 sentence summary of the whole document.
    This summary is later injected into every phase-2 chunk prompt so each
    proposition remains semantically grounded in the document's overall meaning.

    Returns None on failure so the calling pipeline can still proceed without it.
    """
    # Trim the raw content to avoid exceeding context limits for very large docs.
    # 8 000 chars gives the LLM enough signal while staying well inside typical limits.
    prompt = (
        "You are a document analyst. Read the following document content and write a "
        "concise 3-5 sentence summary that captures:\n"
        "  - The document's main topic and purpose\n"
        "  - The key entities, concepts, or subjects discussed\n"
        "  - The overall domain or field it belongs to\n\n"
        "Return ONLY the summary text - no headings, no bullet points, no extra commentary.\n\n"
        f"Document excerpt:\n{raw_content}"
    )

    try:
        response = llm_client.chat.completions.create(
            model=llm_model_name,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.0,
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        import logging
        logging.getLogger(__name__).warning(
            "Could not generate document context summary; proceeding without it. Error: %s", e
        )
        return None


def _process_document_to_chunks(filepath: str, llm_client: OpenAI, llm_model_name: str) -> List[str]:
    """
    Handles Phase 1 & 2.
    Highly testable: Just pass a mock OpenAI client and a dummy file path.

    Enhancement: before the per-chunk loop, a document-level context summary is
    generated and injected into every phase-2 prompt. This prevents chunks from
    losing the general semantic meaning of the source document.
    """
    raw_content = RAGFileProcessService.read_pdf(filepath)
    structure_chunks = RAGFileProcessService.phase1_structure_chunking(raw_content)

    # Generate a document-level context summary once (pre-pass).
    # If this fails, document_context is None and phase-2 falls back to its
    # original behaviour — the pipeline is never blocked.
    document_context = _generate_document_context(llm_client, llm_model_name, raw_content)

    semantic_chunks = []
    for chunk in structure_chunks:
        semantic_chunks.extend(
            RAGFileProcessService.phase2_llm_semantic_chunking(
                llm_client, llm_model_name, chunk, document_context
            )
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