"""
Unit tests for Knowledge Base serializers.

Covers DocumentSerializer methods: get_name, get_file_type, get_size.
"""

import pytest
from django.contrib.auth import get_user_model

from apps.knowledge_base.models import Document, DocumentStatus
from apps.knowledge_base.serializers import DocumentSerializer

User = get_user_model()


@pytest.fixture
def doc(user):
    return Document.objects.create(
        user=user, filename="report.pdf", size_byte=2048,
        status=DocumentStatus.SUCCESS,
    )


@pytest.mark.django_db
class TestDocumentSerializer:

    def test_get_name_returns_filename(self, doc):
        ser = DocumentSerializer(doc)
        assert ser.data["name"] == "report.pdf"

    def test_get_file_type_extracts_extension(self, doc):
        ser = DocumentSerializer(doc)
        assert ser.data["file_type"] == "pdf"

    def test_get_file_type_docx(self, user):
        doc = Document.objects.create(
            user=user, filename="notes.docx", size_byte=100,
            status=DocumentStatus.PENDING,
        )
        ser = DocumentSerializer(doc)
        assert ser.data["file_type"] == "docx"

    def test_get_size_bytes(self, user):
        doc = Document.objects.create(
            user=user, filename="tiny.pdf", size_byte=512,
            status=DocumentStatus.PENDING,
        )
        ser = DocumentSerializer(doc)
        assert ser.data["size"] == "512 B"

    def test_get_size_kilobytes(self, user):
        doc = Document.objects.create(
            user=user, filename="medium.pdf", size_byte=5120,  # 5 KB
            status=DocumentStatus.PENDING,
        )
        ser = DocumentSerializer(doc)
        assert "KB" in ser.data["size"]
        assert "5.0" in ser.data["size"]

    def test_get_size_megabytes(self, user):
        doc = Document.objects.create(
            user=user, filename="large.pdf", size_byte=2_097_152,  # 2 MB
            status=DocumentStatus.PENDING,
        )
        ser = DocumentSerializer(doc)
        assert "MB" in ser.data["size"]
        assert "2.00" in ser.data["size"]

    def test_serialized_fields(self, doc):
        ser = DocumentSerializer(doc)
        assert set(ser.data.keys()) == {"id", "name", "file_type", "size", "upload_date", "status"}
