from openai import OpenAI
import os

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
    # keep track of the document being processed
    source_document = Document.objects.get(id=source_document_id)
    source_document.status = DocumentStatus.PROCESSING
    source_document.save(update_fields=['status'])
    
    # phase 1 structure chunking
    raw_content = RAGFileProcessService.read_pdf(filepath)
    structure_chunks = RAGFileProcessService.phase1_structure_chunking(raw_content)
    
    # phase 2 semantic chunking
    try:
        llm_client = OpenAI(
            base_url=llm_model_url,
            api_key=llm_model_api_key
        )
        
        semantic_chunks = []
        for chunk in structure_chunks:
            semantic_chunks.extend(
                RAGFileProcessService.phase2_llm_semantic_chunking(llm_client, llm_model_name, chunk)
            )
        
        # write semantics and their embedding vector to db
        embed_model = EmbeddingModel.get_embed_model()
        final_chunks = []
        for chunk in semantic_chunks:
            final_chunks.append(DocumentChunk(
                content = chunk, 
                embedding = embed_model.encode(chunk).tolist(),
                source_document = source_document,
            ))
        DocumentChunk.objects.bulk_create(final_chunks)
    except Exception as e:
        source_document.status = DocumentStatus.FAILED
        source_document.error_message = str(e)
        raise e
    else:
        source_document.status = DocumentStatus.SUCCESS
    finally:
        source_document.save(update_fields=["status"])
        if os.path.exists(filepath):
            os.remove(filepath)
        