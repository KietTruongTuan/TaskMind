from rest_framework import status
from rest_framework import serializers
from rest_framework.views import APIView
from rest_framework.generics import GenericAPIView
from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from django_q.tasks import async_task
from django_q.models import Task
from django.conf import settings
import os

class FileUploadSerializer(serializers.Serializer):
    file = serializers.FileField()

class DocumentUploadProcessView(GenericAPIView):
    """
    Endpoint for Next.js to upload the PDF.
    Accepts POST requests.
    """
    # require user to logged in, to associate this document to their account
    # permission_classes = [IsAuthenticated]
    
    parser_classes = [MultiPartParser, FormParser]
    
    # 3. Attach the blueprint to the view
    serializer_class = FileUploadSerializer
    
    def get(self, request, *args, **kwargs):
        return Response({
            "instruction": "Scroll down and use the HTML form below to upload your PDF."
        })
        
    def post(self, request: Request):
        
        # get uploaded files from request
        uploaded_file = request.FILES.get('file')
        if not uploaded_file:
            return Response({"error": "No file uploaded"}, status=status.HTTP_400_BAD_REQUEST)
        
        if uploaded_file.size > settings.MAX_FILE_SIZE:
            return Response(
                {"error": f"File '{uploaded_file.name}' exceeds the 10MB size limit."},
                status=status.HTTP_400_BAD_REQUEST,
            )
           
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        uploaded_file = serializer.validated_data['file'] 
        filepath = settings.BASE_DIR / "storage" / uploaded_file.name
        with open(filepath, "wb+") as dest:
            # store the file temporarily in storage
            for chunk in uploaded_file:
                dest.write(chunk)
            
        # run the rag pipeline in background
        task_id = async_task(
            'apps.knowledge_base.tasks.run_rag_processing_pipeline_task',
            filepath,   
            uploaded_file.name,
            settings.RAG_LLM_MODEL_NAME,
            settings.RAG_LLM_API_URL,
            settings.RAG_LLM_API_KEY,
            1
        )
        
        return Response({
            "message": "Document uploaded sucessfully. Processing is underway.",
            "task_id": task_id
        }, status=status.HTTP_202_ACCEPTED)