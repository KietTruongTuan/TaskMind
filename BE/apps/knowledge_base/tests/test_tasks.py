"""
Unit tests for Knowledge Base background tasks.

Covers helper functions: _update_document_status, _handle_document_failure, _cleanup_file.
The main orchestrator task is tested at a higher level via mocks.
"""

import os
import pytest
from unittest.mock import patch, MagicMock
from django.contrib.auth import get_user_model

from apps.knowledge_base.models import Document, DocumentStatus
from apps.knowledge_base.tasks import (
    _update_document_status,
    _handle_document_failure,
    _cleanup_file,
)

User = get_user_model()


@pytest.fixture
def doc(user):
    return Document.objects.create(
        user=user, filename="task_test.pdf", size_byte=100,
        status=DocumentStatus.PENDING,
    )


# ===========================================================================
# _update_document_status
# ===========================================================================


@pytest.mark.django_db
class TestUpdateDocumentStatus:

    def test_updates_to_processing(self, doc):
        _update_document_status(doc, DocumentStatus.PROCESSING)
        doc.refresh_from_db()
        assert doc.status == DocumentStatus.PROCESSING

    def test_updates_to_success(self, doc):
        _update_document_status(doc, DocumentStatus.SUCCESS)
        doc.refresh_from_db()
        assert doc.status == DocumentStatus.SUCCESS


# ===========================================================================
# _handle_document_failure
# ===========================================================================


@pytest.mark.django_db
class TestHandleDocumentFailure:

    def test_sets_failed_status_and_error_message(self, doc):
        _handle_document_failure(doc, "Something went wrong")
        doc.refresh_from_db()
        assert doc.status == DocumentStatus.FAILED
        assert doc.error_message == "Something went wrong"


# ===========================================================================
# _cleanup_file
# ===========================================================================


class TestCleanupFile:

    def test_removes_existing_file(self, tmp_path):
        file_path = tmp_path / "temp.pdf"
        file_path.write_text("content")
        assert file_path.exists()
        _cleanup_file(str(file_path))
        assert not file_path.exists()

    def test_no_error_if_file_missing(self, tmp_path):
        missing = str(tmp_path / "does_not_exist.pdf")
        # Should not raise
        _cleanup_file(missing)
