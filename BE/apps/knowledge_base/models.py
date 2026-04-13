from django.db import models
from pgvector.django import VectorField
from django.conf import settings

VECTOR_DIM = 384

# Create your models here.
class DocumentChunk(models.Model):
    content = models.TextField()
    embedding = VectorField(dimensions=VECTOR_DIM)
    created_at = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey(
        to=settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    source_filename = models.CharField(max_length=255, default=None)
    is_global = models.BooleanField(default=False)