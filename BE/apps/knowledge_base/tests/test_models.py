"""
Unit tests for Knowledge Base models (Document, DocumentChunk, DocumentStatus).

NOTE: DocumentChunk uses pgvector's VectorField which requires PostgreSQL.
On SQLite (test default), we test Document model only and skip vector-dependent tests.
"""

import pytest
from django.contrib.auth import get_user_model
from django.db import connection

from apps.knowledge_base.models import Document, DocumentChunk, DocumentStatus

User = get_user_model()

from django.conf import settings
is_sqlite = "sqlite" in settings.DATABASES["default"]["ENGINE"]


@pytest.mark.django_db
class TestDocumentStatusChoices:

    def test_pending_value(self):
        assert DocumentStatus.PENDING == "Pending"

    def test_processing_value(self):
        assert DocumentStatus.PROCESSING == "Processing"

    def test_success_value(self):
        assert DocumentStatus.SUCCESS == "Success"

    def test_failed_value(self):
        assert DocumentStatus.FAILED == "Failed"

    def test_all_choices_count(self):
        assert len(DocumentStatus.choices) == 4


@pytest.mark.django_db
class TestDocumentModel:

    def test_create_document(self, user):
        doc = Document.objects.create(
            user=user,
            filename="report.pdf",
            size_byte=1024,
            status=DocumentStatus.PENDING,
        )
        assert doc.id is not None
        assert doc.filename == "report.pdf"
        assert doc.size_byte == 1024
        assert doc.status == DocumentStatus.PENDING
        assert doc.upload_date is not None

    def test_is_deleted_defaults_to_false(self, user):
        doc = Document.objects.create(
            user=user, filename="f.pdf", size_byte=100, status=DocumentStatus.PENDING
        )
        assert doc.is_deleted is False

    def test_is_global_defaults_to_false(self, user):
        doc = Document.objects.create(
            user=user, filename="f.pdf", size_byte=100, status=DocumentStatus.PENDING
        )
        assert doc.is_global is False

    def test_user_can_be_null(self):
        doc = Document.objects.create(
            user=None, filename="global.pdf", size_byte=500,
            status=DocumentStatus.PENDING, is_global=True,
        )
        assert doc.user is None

    def test_soft_delete_flag(self, user):
        doc = Document.objects.create(
            user=user, filename="del.pdf", size_byte=100, status=DocumentStatus.SUCCESS,
        )
        doc.is_deleted = True
        doc.save()
        doc.refresh_from_db()
        assert doc.is_deleted is True

    def test_task_id_can_be_set(self, user):
        doc = Document.objects.create(
            user=user, filename="f.pdf", size_byte=100,
            status=DocumentStatus.PROCESSING, task_id="abc-123",
        )
        assert doc.task_id == "abc-123"

    def test_error_message_stored(self, user):
        doc = Document.objects.create(
            user=user, filename="f.pdf", size_byte=100,
            status=DocumentStatus.FAILED, error_message="Parse error",
        )
        assert doc.error_message == "Parse error"


@pytest.mark.django_db
@pytest.mark.skipif(is_sqlite, reason="VectorField requires PostgreSQL + pgvector")
class TestDocumentChunkModel:

    def test_cascade_delete_removes_chunks(self, user):
        doc = Document.objects.create(
            user=user, filename="f.pdf", size_byte=100, status=DocumentStatus.SUCCESS,
        )
        DocumentChunk.objects.create(
            content="chunk text",
            embedding=[0.0] * 384,
            source_document=doc,
        )
        assert DocumentChunk.objects.filter(source_document=doc).count() == 1
        doc_id = doc.id
        doc.delete()
        assert DocumentChunk.objects.filter(source_document_id=doc_id).count() == 0
