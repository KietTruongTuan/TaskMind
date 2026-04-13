from openai import OpenAI

from .models import DocumentChunk
from .services import RAGFileProcessService
from .embedding_model import EmbeddingModel

def run_rag_processing_pipeline_task(
    filepath: str,
    filename: str,
    llm_model_name: str,
    llm_model_url: str,
    llm_model_api_key: str,
    user_id: int
):
    raw_content = RAGFileProcessService.read_pdf(filepath)
    structure_chunks = RAGFileProcessService.phase1_structure_chunking(raw_content)
    
    llm_client = OpenAI(
        base_url=llm_model_url,
        api_key=llm_model_api_key
    )
    
    semantic_chunks = []
    for chunk in structure_chunks:
        semantic_chunks.extend(
            RAGFileProcessService.phase2_llm_semantic_chunking(llm_client, llm_model_name, chunk)
        )
    
    embed_model = EmbeddingModel.get_embed_model()
    
    # write semantics and their embedding vector to db
    final_chunks = []
    for chunk in semantic_chunks:
        final_chunks.append(DocumentChunk(
            content = chunk, 
            embedding = embed_model.encode(chunk).tolist(),
            user_id = user_id,
            source_filename = filename
        ))
        
    DocumentChunk.objects.bulk_create(final_chunks)