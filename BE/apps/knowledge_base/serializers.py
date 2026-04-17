from django.conf import settings
from rest_framework import (
    serializers,
    status,
)
from rest_framework.response import Response
from .models import Document 

class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = "__all__"
        
class DocumentUploadSerializer(serializers.Serializer):
    file = serializers.FileField()
    
    def validate_file(self, file):
        if not file:
            raise serializers.ValidationError("No file was uploaded")
        if not any([file.name.endswith(ext) for ext in settings.RAG_ALLOWED_EXTENSIONS]):
            raise serializers.ValidationError(f"Invalid file type. Allowed types are {settings.RAG_ALLOWED_EXTENSIONS}")
        if file.size > settings.MAX_FILE_SIZE:
            raise serializers.ValidationError(f"File size limit exceeded. Max allowed is {settings.MAX_FILE_SIZE}")
        return file