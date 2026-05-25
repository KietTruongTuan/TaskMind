from django.conf import settings
from rest_framework import serializers
from .models import Document

def file_size(size_byte: int) -> str:
    if size_byte < 1024:
        return f"{size_byte} B"
    elif size_byte < 1048_576: # 1024 * 1024
        return f"{size_byte / 1024:.1f} KB"
    else:
        return f"{size_byte / 1048576:.2f} MB"

class DocumentSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    file_type = serializers.SerializerMethodField()
    size = serializers.SerializerMethodField()
    
    
    class Meta:
        model = Document
        fields = ["id", "name", "file_type", "size", "upload_date", "status"]
            
    def get_name(self, obj: Document):
        return obj.filename
    
    def get_file_type(self, obj: Document):
        return obj.filename.split('.')[-1]
        
    def get_size(self, obj: Document):
        return file_size(obj.size_byte)
        
        
class DocumentUploadProcessSerializer(serializers.Serializer):
    files = serializers.ListField(
        child=serializers.FileField(),
        allow_empty=False,
        error_messages={"empty": "No files was uploaded"}
    )
    
    def validate_files(self, files):
        for file in files:
            if not any([file.name.endswith(ext) for ext in settings.RAG_ALLOWED_EXTENSIONS]):
                raise serializers.ValidationError(f"Invalid file type for {file.name}. Allowed types are {settings.RAG_ALLOWED_EXTENSIONS}")
            if file.size > settings.MAX_FILE_SIZE:
                raise serializers.ValidationError(f"File size limit exceeded for {file.name}. Max allowed is {file_size(settings.MAX_FILE_SIZE)}")
        return files
    
class DocumentBulkDeleteSerializer(serializers.Serializer):
    document_ids = serializers.ListField(
        child=serializers.IntegerField(),
        allow_empty=False,
        help_text="Provide an array of documents ID to delete them",
    )