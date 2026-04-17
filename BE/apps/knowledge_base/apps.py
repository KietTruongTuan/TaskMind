from django.apps import AppConfig
import os


class KnowledgeBaseConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.knowledge_base'
    embed_model = None