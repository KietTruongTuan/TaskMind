from django.db import models
from pgvector.django import VectorField
from django.conf import settings

VECTOR_DIM = 384

# Create your models here.

class DocumentStatus(models.TextChoices):
    UPLOADED    = "UPLOADED", 'Uploaded'        # file uploaded successfully, waiting in queue to be processed
    PROCESSING  = 'PROCESSING', 'Processing'    # rag pipeline initiated, processing is underway
    SUCCESS     = "SUCCESS", 'Success'          # Rag pipeline finished successfully, file is available for knowledge base
    FAILED      = "FAILED", "Failed"            # Rag pipeline was not completed
    
    
class Document(models.Model):
    user = models.ForeignKey(
        to=settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    filename = models.CharField(max_length=255)
    size_byte = models.PositiveIntegerField()
    upload_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(
        max_length=20,
        choices=DocumentStatus.choices
    )
    task_id = models.CharField(max_length=100, blank=True, null=True)   # ID of the django-q2 task processing this file
    error_message = models.TextField(blank=True, null=True)
    is_global = models.BooleanField(default=False)                      # knowledge chunks from global documents are available to all users 
    
    
class DocumentChunk(models.Model):
    content = models.TextField()
    embedding = VectorField(dimensions=VECTOR_DIM)
    created_at = models.DateTimeField(auto_now_add=True)
    source_document = models.ForeignKey(
        to=Document,
        on_delete=models.CASCADE,
        null=False,
        related_name='chunks',
    )