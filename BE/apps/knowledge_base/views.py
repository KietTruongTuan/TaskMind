from typing import List

from django.conf import settings

from django.shortcuts import get_object_or_404
from django.core.files.uploadedfile import UploadedFile
from django_q.tasks import async_task
from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import status
from rest_framework.parsers import FormParser, MultiPartParser, JSONParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Document, DocumentStatus
from .serializers import DocumentSerializer, DocumentUploadProcessSerializer, DocumentBulkDeleteSerializer


@extend_schema_view(
    get=extend_schema(
        tags=["Knowledge base"],
        summary="Get list of all uploaded document",
        description="Get a list of all uploaded documents ordered by upload date filtered by user id.",
        responses={200: DocumentSerializer(many=True)},
    ),
    post=extend_schema(
        tags=["Knowledge base"],
        summary="Upload document",
        description="Upload pdf, docx document for RAG processing",
        request={
            "multipart/form-data": DocumentUploadProcessSerializer
        },
        responses={202: DocumentUploadProcessSerializer},
    ),
    delete=extend_schema(
        tags=["Knowledge base"],
        summary="Delete a list of documents from knowledge base",
        description="Delete documents with provided ids, deleted documents are no longer accessible to the GET request and its context will no longer be used for goal creation",
        request=DocumentBulkDeleteSerializer,
        responses={204: None}
    )
)
class DocumentUploadProcessView(APIView):
    """
    Endpoint for Next.js to interact with the knowledge base
    Accepts
        POST    -> Upload file(s) to run RAG process and update knowledge base
        GET     -> Gets the list of all the files users uploaded
        DELETE  -> Delete a list of files from knowledge base by ids
    """

    # require user to logged in, to associate this document to their account
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    serializer_class = DocumentUploadProcessSerializer
    
    def get(self, request: Request, *args, **kwargs):
        """return a list of files uploaded by the users, with their information"""
        documents = Document.objects.filter(
            user=request.user,
            is_deleted=False,
        ).order_by(
            "-upload_date"
        )
        serializer = DocumentSerializer(documents, many=True)
        return Response(serializer.data)

    def post(self, request: Request):
        # get uploaded files from request + validate uploaded file
        data = {"files": request.FILES.getlist("files")}
        upload_serializer = DocumentUploadProcessSerializer(data=data)
        if not upload_serializer.is_valid():
            return Response(
                upload_serializer.errors, status=status.HTTP_400_BAD_REQUEST
            )
        uploaded_files: List[UploadedFile] = upload_serializer.validated_data["files"]
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
                "message": "Document uploaded successfully, processing is underway.",
                "document": DocumentSerializer(processed_files, many=True).data,
            },
            status=status.HTTP_202_ACCEPTED,
        )

    def delete(self, request: Request):
        """soft delete documents in bulk"""
        # get list of documents to delete
        serializer = DocumentBulkDeleteSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {"error": "Not a valid list of document_ids"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        document_ids = serializer.validated_data["document_ids"]
        
        # bulk delete
        Document.objects.filter(
            id__in=document_ids,
            user=request.user,
            is_deleted=False,
        ).update(is_deleted=True)
        
        return Response(status=status.HTTP_204_NO_CONTENT)
    
@extend_schema_view(
    delete=extend_schema(
        tags=["Knowledge base"],
        summary="Delete a file",
        description="Delete a single file from knowledge base by its id.",
        responses={204: None},
    ),
)
class DocumentDetailView(APIView):
    """
    Supplement endpoint for DocumentUploadProcessView, focus on single document processes
    Accepts
        DELETE  -> Delete a single file from knowledge base by id
    """
    def delete(self, request: Request, pk: int):
        """soft delete a document by its id"""
        document = get_object_or_404(Document, id=pk, user=request.user)
        document.is_deleted = True
        document.save(update_fields=['is_deleted'])
        return Response(status=status.HTTP_204_NO_CONTENT)