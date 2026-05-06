"""
View-level tests for Knowledge Base endpoints:
  - GET    /v1/knowledge-base/documents
  - POST   /v1/knowledge-base/documents
  - DELETE /v1/knowledge-base/documents  (bulk)
  - DELETE /v1/knowledge-base/documents/{pk}/
"""

import pytest
from unittest.mock import patch
from django.core.files.uploadedfile import SimpleUploadedFile
from django.contrib.auth import get_user_model

from apps.knowledge_base.models import Document, DocumentStatus

User = get_user_model()


@pytest.fixture
def doc(user):
    return Document.objects.create(
        user=user, filename="test.pdf", size_byte=1024,
        status=DocumentStatus.SUCCESS,
    )


@pytest.fixture
def doc_deleted(user):
    return Document.objects.create(
        user=user, filename="old.pdf", size_byte=512,
        status=DocumentStatus.SUCCESS, is_deleted=True,
    )


# ===========================================================================
# GET — List Documents
# ===========================================================================


@pytest.mark.django_db
class TestDocumentList:

    def test_list_returns_user_documents(self, auth_client, doc):
        response = auth_client.get("/v1/knowledge-base/documents")
        assert response.status_code == 200
        assert len(response.data) == 1
        assert response.data[0]["name"] == "test.pdf"

    def test_list_excludes_soft_deleted(self, auth_client, doc, doc_deleted):
        response = auth_client.get("/v1/knowledge-base/documents")
        assert response.status_code == 200
        names = [d["name"] for d in response.data]
        assert "test.pdf" in names
        assert "old.pdf" not in names

    def test_list_user_isolation(self, auth_client, other_user):
        Document.objects.create(
            user=other_user, filename="other.pdf", size_byte=100,
            status=DocumentStatus.SUCCESS,
        )
        response = auth_client.get("/v1/knowledge-base/documents")
        assert response.status_code == 200
        assert len(response.data) == 0

    def test_list_unauthenticated_returns_401(self, api_client):
        response = api_client.get("/v1/knowledge-base/documents")
        assert response.status_code == 401


# ===========================================================================
# POST — Upload Documents
# ===========================================================================


@pytest.mark.django_db
class TestDocumentUpload:

    @patch("apps.knowledge_base.views.async_task", return_value="task-id-123")
    def test_upload_success(self, mock_async, auth_client, tmp_path):
        pdf = SimpleUploadedFile("upload.pdf", b"fake pdf content", content_type="application/pdf")
        response = auth_client.post(
            "/v1/knowledge-base/documents",
            {"files": [pdf]},
            format="multipart",
        )
        assert response.status_code == 202
        assert "document" in response.data
        assert Document.objects.filter(filename="upload.pdf").exists()
        mock_async.assert_called_once()

    def test_upload_no_files_returns_400(self, auth_client):
        response = auth_client.post(
            "/v1/knowledge-base/documents",
            {},
            format="multipart",
        )
        assert response.status_code == 400

    def test_upload_unauthenticated_returns_401(self, api_client):
        pdf = SimpleUploadedFile("f.pdf", b"content", content_type="application/pdf")
        response = api_client.post(
            "/v1/knowledge-base/documents",
            {"files": [pdf]},
            format="multipart",
        )
        assert response.status_code == 401


# ===========================================================================
# DELETE — Bulk Soft Delete
# ===========================================================================


@pytest.mark.django_db
class TestDocumentBulkDelete:

    def test_bulk_delete_success(self, auth_client, doc):
        response = auth_client.delete(
            "/v1/knowledge-base/documents",
            {"document_ids": [doc.id]},
            format="json",
        )
        assert response.status_code == 204
        doc.refresh_from_db()
        assert doc.is_deleted is True

    def test_bulk_delete_invalid_payload_returns_400(self, auth_client):
        response = auth_client.delete(
            "/v1/knowledge-base/documents",
            {"document_ids": []},
            format="json",
        )
        assert response.status_code == 400

    def test_bulk_delete_cannot_delete_other_users_docs(self, auth_client, other_user):
        other_doc = Document.objects.create(
            user=other_user, filename="private.pdf", size_byte=100,
            status=DocumentStatus.SUCCESS,
        )
        auth_client.delete(
            "/v1/knowledge-base/documents",
            {"document_ids": [other_doc.id]},
            format="json",
        )
        other_doc.refresh_from_db()
        assert other_doc.is_deleted is False  # unchanged


# ===========================================================================
# DELETE — Single Document
# ===========================================================================


@pytest.mark.django_db
class TestDocumentDetailDelete:

    def test_single_delete_success(self, auth_client, doc):
        response = auth_client.delete(f"/v1/knowledge-base/documents/{doc.id}/")
        assert response.status_code == 204
        doc.refresh_from_db()
        assert doc.is_deleted is True

    def test_single_delete_not_found(self, auth_client):
        response = auth_client.delete("/v1/knowledge-base/documents/99999/")
        assert response.status_code == 404

    def test_single_delete_cannot_delete_other_users_doc(self, auth_client, other_user):
        other_doc = Document.objects.create(
            user=other_user, filename="secret.pdf", size_byte=100,
            status=DocumentStatus.SUCCESS,
        )
        response = auth_client.delete(f"/v1/knowledge-base/documents/{other_doc.id}/")
        assert response.status_code == 404
        other_doc.refresh_from_db()
        assert other_doc.is_deleted is False
