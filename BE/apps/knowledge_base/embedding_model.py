from django.conf import settings

class EmbeddingModel:
    _instance = None
    
    @classmethod
    def get_embed_model(cls):
        if cls._instance is None:
            from sentence_transformers import SentenceTransformer
            cls._instance = SentenceTransformer(settings.RAG_EMBED_MODEL_NAME)
        return cls._instance