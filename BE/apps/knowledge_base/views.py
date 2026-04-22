from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from django_q.tasks import async_task
from django_q.models import Task
from django.conf import settings

from .serializers import DocumentSerializer, DocumentUploadProcessSerializer
from .models import Document, DocumentChunk, DocumentStatus

# for type hint
from django.core.files.uploadedfile import UploadedFile
from typing import List


class DocumentUploadProcessView(APIView):
    """
    Endpoint for Next.js to upload the document.
    Accepts
        POST    -> Upload file(s) to run rag process and update knowlegde base
        GET     -> Gets the list of all the files users uploaded
    """

    # require user to logged in, to associate this document to their account
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    serializer_class = DocumentUploadProcessSerializer

    def get(self, request: Request, *args, **kwargs):
        """return a list of files uploaded by the users, with their information"""
        documents = Document.objects.filter(user=request.user.id).order_by(
            "-upload_date"
        )
        serializer = DocumentSerializer(documents, many=True)
        return Response(serializer.data)

    def post(self, request: Request):
        # get uploaded files from request + validate uploaded file
        data = {"file": request.FILES.getlist("files")}
        upload_serializer = DocumentUploadProcessSerializer(data=data)
        if not upload_serializer.is_valid():
            return Response(
                upload_serializer.errors, status=status.HTTP_400_BAD_REQUEST
            )
        uploaded_files: List[UploadedFile] = upload_serializer.validated_data["file"]
        processed_files: List[Document] = []

        for uploaded_file in uploaded_files:
            # save a tracking record in db
            document_record = Document.objects.create(
                user=request.user,
                filename=uploaded_file.name,
                size_byte=uploaded_file.size,
            )

            # store the file temporarily for processing
            filepath = settings.BASE_DIR / "storage" / uploaded_file.name
            filepath.parent.mkdir(parents=True, exist_ok=True)
            with open(filepath, "wb+") as dest:
                # store the file temporarily in storage
                for chunk in uploaded_file.chunks():
                    dest.write(chunk)
            document_record.status = DocumentStatus.PENDING

            # run the rag pipeline in background
            task_id = async_task(
                "apps.knowledge_base.tasks.run_rag_processing_pipeline_task",
                str(filepath),
                settings.RAG_LLM_MODEL_NAME,
                settings.RAG_LLM_API_URL,
                settings.RAG_LLM_API_KEY,
                document_record.id,
            )
            document_record.task_id = task_id
            document_record.save()
            processed_files.append(document_record)

        return Response(
            {
                "message": "Document uploaded sucessfully, processing is underway.",
                "document": DocumentSerializer(processed_files, many=True).data,
            },
            status=status.HTTP_202_ACCEPTED,
        )
