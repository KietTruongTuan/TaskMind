"""
Unit tests for Knowledge Base background tasks.

Covers helper functions: _update_document_status, _handle_document_failure,
_cleanup_file, _generate_document_context, and _process_document_to_chunks.
The main orchestrator task is tested at a higher level via mocks.
"""

import os
import json
import pytest
from unittest.mock import patch, MagicMock, call
from django.contrib.auth import get_user_model

from apps.knowledge_base.models import Document, DocumentStatus
from apps.knowledge_base.tasks import (
    _update_document_status,
    _handle_document_failure,
    _cleanup_file,
    _generate_document_context,
    _process_document_to_chunks,
)

User = get_user_model()


@pytest.fixture
def doc(user):
    return Document.objects.create(
        user=user, filename="task_test.pdf", size_byte=100,
        status=DocumentStatus.PENDING,
    )


def _make_llm_client(response_content: str) -> MagicMock:
    """Return a mock OpenAI client whose first completion returns *response_content*."""
    mock_choice = MagicMock()
    mock_choice.message.content = response_content

    mock_response = MagicMock()
    mock_response.choices = [mock_choice]

    mock_client = MagicMock()
    mock_client.chat.completions.create.return_value = mock_response
    return mock_client


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


# ===========================================================================
# _generate_document_context
# ===========================================================================


class TestGenerateDocumentContext:

    def test_returns_stripped_summary_on_success(self):
        """Happy path: LLM responds with a summary, function returns it stripped."""
        raw_summary = "  This doc is about Python testing.  \n"
        client = _make_llm_client(raw_summary)

        result = _generate_document_context(client, "model-x", "Document body text.")

        assert result == raw_summary.strip()

    def test_raw_content_included_in_prompt(self):
        """The full raw content must be embedded in the prompt sent to the LLM."""
        client = _make_llm_client("summary text")
        sentinel = "sentinel-raw-content-9876"

        _generate_document_context(client, "model-x", sentinel)

        sent_prompt = client.chat.completions.create.call_args[1]["messages"][0]["content"]
        assert sentinel in sent_prompt

    def test_called_with_temperature_zero(self):
        """Document-level summary must be deterministic: temperature should be 0.0."""
        client = _make_llm_client("summary")

        _generate_document_context(client, "model-x", "content")

        call_kwargs = client.chat.completions.create.call_args[1]
        assert call_kwargs["temperature"] == 0.0

    def test_returns_none_on_llm_failure(self):
        """If the LLM call raises any exception, the function must return None
        (graceful degradation) and must not propagate the exception."""
        client = MagicMock()
        client.chat.completions.create.side_effect = Exception("network error")

        result = _generate_document_context(client, "model-x", "content")

        assert result is None

    def test_returns_none_and_logs_warning_on_failure(self, caplog):
        """A warning must be logged when the LLM call fails."""
        import logging
        client = MagicMock()
        client.chat.completions.create.side_effect = RuntimeError("timeout")

        with caplog.at_level(logging.WARNING):
            result = _generate_document_context(client, "model-x", "content")

        assert result is None
        assert any("proceeding without it" in r.message for r in caplog.records)


# ===========================================================================
# _process_document_to_chunks
# ===========================================================================


class TestProcessDocumentToChunks:
    """Tests for the orchestration of Phase 1 + 2 with the new document-context pre-pass."""

    @patch("apps.knowledge_base.tasks.RAGFileProcessService.phase2_llm_semantic_chunking")
    @patch("apps.knowledge_base.tasks._generate_document_context")
    @patch("apps.knowledge_base.tasks.RAGFileProcessService.phase1_structure_chunking")
    @patch("apps.knowledge_base.tasks.RAGFileProcessService.read_pdf")
    def test_document_context_generated_once(
        self, mock_read, mock_phase1, mock_ctx, mock_phase2
    ):
        """_generate_document_context must be called exactly once per document,
        regardless of how many phase-1 chunks are produced."""
        mock_read.return_value = "raw content"
        mock_phase1.return_value = ["chunk1", "chunk2", "chunk3"]
        mock_ctx.return_value = "document summary"
        mock_phase2.return_value = ["semantic chunk"]

        client = MagicMock()
        _process_document_to_chunks("fake/path.pdf", client, "model")

        mock_ctx.assert_called_once_with(client, "model", "raw content")

    @patch("apps.knowledge_base.tasks.RAGFileProcessService.phase2_llm_semantic_chunking")
    @patch("apps.knowledge_base.tasks._generate_document_context")
    @patch("apps.knowledge_base.tasks.RAGFileProcessService.phase1_structure_chunking")
    @patch("apps.knowledge_base.tasks.RAGFileProcessService.read_pdf")
    def test_document_context_forwarded_to_every_phase2_call(
        self, mock_read, mock_phase1, mock_ctx, mock_phase2
    ):
        """The same document context string must be passed positionally to every
        phase2_llm_semantic_chunking call."""
        mock_read.return_value = "raw content"
        mock_phase1.return_value = ["chunk1", "chunk2"]
        mock_ctx.return_value = "the context"
        mock_phase2.return_value = ["s"]

        client = MagicMock()
        _process_document_to_chunks("fake/path.pdf", client, "model")

        # Every call must include "the context" as the 4th positional argument
        for c in mock_phase2.call_args_list:
            args = c[0]  # positional args tuple
            assert args[3] == "the context", (
                f"document_context not forwarded correctly: call args = {c}"
            )

    @patch("apps.knowledge_base.tasks.RAGFileProcessService.phase2_llm_semantic_chunking")
    @patch("apps.knowledge_base.tasks._generate_document_context")
    @patch("apps.knowledge_base.tasks.RAGFileProcessService.phase1_structure_chunking")
    @patch("apps.knowledge_base.tasks.RAGFileProcessService.read_pdf")
    def test_phase2_called_once_per_phase1_chunk(
        self, mock_read, mock_phase1, mock_ctx, mock_phase2
    ):
        """phase2_llm_semantic_chunking must be called once per structural chunk."""
        mock_read.return_value = "raw"
        mock_phase1.return_value = ["A", "B", "C"]
        mock_ctx.return_value = None
        mock_phase2.return_value = ["s"]

        client = MagicMock()
        _process_document_to_chunks("fake/path.pdf", client, "model")

        assert mock_phase2.call_count == 3

    @patch("apps.knowledge_base.tasks.RAGFileProcessService.phase2_llm_semantic_chunking")
    @patch("apps.knowledge_base.tasks._generate_document_context")
    @patch("apps.knowledge_base.tasks.RAGFileProcessService.phase1_structure_chunking")
    @patch("apps.knowledge_base.tasks.RAGFileProcessService.read_pdf")
    def test_semantic_chunks_are_flattened(
        self, mock_read, mock_phase1, mock_ctx, mock_phase2
    ):
        """Results from multiple phase2 calls must be flattened into a single list."""
        mock_read.return_value = "raw"
        mock_phase1.return_value = ["chunk1", "chunk2"]
        mock_ctx.return_value = None
        mock_phase2.side_effect = [["s1", "s2"], ["s3"]]

        client = MagicMock()
        result = _process_document_to_chunks("fake/path.pdf", client, "model")

        assert result == ["s1", "s2", "s3"]

    @patch("apps.knowledge_base.tasks.RAGFileProcessService.phase2_llm_semantic_chunking")
    @patch("apps.knowledge_base.tasks._generate_document_context")
    @patch("apps.knowledge_base.tasks.RAGFileProcessService.phase1_structure_chunking")
    @patch("apps.knowledge_base.tasks.RAGFileProcessService.read_pdf")
    def test_none_context_still_forwarded_to_phase2(
        self, mock_read, mock_phase1, mock_ctx, mock_phase2
    ):
        """When _generate_document_context returns None (failure), None must still be
        forwarded to phase2 so phase2 falls back to its no-context behaviour."""
        mock_read.return_value = "raw"
        mock_phase1.return_value = ["chunk1"]
        mock_ctx.return_value = None
        mock_phase2.return_value = ["s"]

        client = MagicMock()
        _process_document_to_chunks("fake/path.pdf", client, "model")

        args = mock_phase2.call_args[0]
        assert args[3] is None

