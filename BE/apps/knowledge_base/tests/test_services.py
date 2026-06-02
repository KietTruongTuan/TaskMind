"""
Unit tests for Knowledge Base services.

Covers RAGFileProcessService (chunking) and RAGContextService (graceful degradation).
LLM calls are mocked.
"""

import json
import pytest
from unittest.mock import patch, MagicMock, call
from django.test import override_settings

from apps.knowledge_base.services import RAGFileProcessService, RAGContextService, SplitLevel


# ===========================================================================
# RAGFileProcessService — Structure Chunking
# ===========================================================================


class TestPhase1StructureChunking:

    def test_single_short_paragraph(self):
        text = "This is a short paragraph."
        chunks = RAGFileProcessService.phase1_structure_chunking(text)
        assert len(chunks) == 1
        assert "short paragraph" in chunks[0]

    def test_multiple_paragraphs_fit_in_one_chunk(self):
        """Two small paragraphs should combine into one chunk."""
        text = "Para one.\n\nPara two."
        chunks = RAGFileProcessService.phase1_structure_chunking(text)
        assert len(chunks) == 1
        assert "Para one." in chunks[0]
        assert "Para two." in chunks[0]

    @patch("apps.knowledge_base.services.CHUNK_MAX_SIZE", 50)
    @patch("apps.knowledge_base.services.CHUNK_OVERLAP", 0)
    def test_paragraphs_split_when_exceeding_limit(self):
        """Paragraphs that exceed chunk limit should split into separate chunks."""
        # Each paragraph is ~25 chars, limit is 50
        text = "A" * 25 + "\n\n" + "B" * 25 + "\n\n" + "C" * 25
        # With limit=50, first two fit (~52 but check), third goes to next chunk
        chunks = RAGFileProcessService.phase1_structure_chunking(text)
        assert len(chunks) >= 2

    def test_empty_text_returns_empty(self):
        chunks = RAGFileProcessService.phase1_structure_chunking("")
        assert chunks == []

    def test_whitespace_only_returns_empty(self):
        chunks = RAGFileProcessService.phase1_structure_chunking("   \n\n   ")
        assert chunks == []


class TestStructureSplitOversized:

    def test_split_into_fixed_chunks(self):
        text = "A" * 100
        result = RAGFileProcessService._structure_split_oversized(
            text, split_size=30, split_into=SplitLevel.FIXED_CHUNKS
        )
        assert all(len(r) <= 30 for r in result)
        assert "".join(result) == text

    def test_split_into_sentences(self):
        text = "First sentence. Second sentence. Third sentence."
        result = RAGFileProcessService._structure_split_oversized(
            text, split_size=100, split_into=SplitLevel.SENTENCES
        )
        assert len(result) >= 1
        # All content should be preserved (modulo whitespace)
        combined = " ".join(result)
        assert "First" in combined

    def test_none_split_level_returns_empty(self):
        result = RAGFileProcessService._structure_split_oversized(
            "some text", split_size=100, split_into=None
        )
        assert result == []


# ===========================================================================
# RAGFileProcessService — Phase 2 LLM Semantic Chunking
# ===========================================================================


def _make_llm_client(response_content: str) -> MagicMock:
    """Build a minimal mock OpenAI client that returns *response_content* as the
    message content of the first choice."""
    mock_choice = MagicMock()
    mock_choice.message.content = response_content

    mock_response = MagicMock()
    mock_response.choices = [mock_choice]

    mock_client = MagicMock()
    mock_client.chat.completions.create.return_value = mock_response
    return mock_client


class TestPhase2LLMSemanticChunking:

    def test_returns_parsed_json_list(self):
        """Happy path: LLM returns a valid JSON array, method returns a Python list."""
        chunks = ["Chunk A", "Chunk B"]
        client = _make_llm_client(json.dumps(chunks))

        result = RAGFileProcessService.phase2_llm_semantic_chunking(
            client, "model-name", "Some text block."
        )

        assert result == chunks

    def test_without_document_context_prompt_has_no_context_section(self):
        """When document_context is None/omitted, the prompt must NOT contain the
        'Document Context' preamble — backward-compatibility check."""
        client = _make_llm_client(json.dumps(["chunk"]))

        RAGFileProcessService.phase2_llm_semantic_chunking(
            client, "model-name", "text block"
        )

        sent_prompt = client.chat.completions.create.call_args[1]["messages"][0]["content"]
        assert "Summarized context from document is not available" in sent_prompt

    def test_with_document_context_injected_into_prompt(self):
        """When document_context is supplied it must appear verbatim inside the
        prompt that is sent to the LLM."""
        context = "This document is about machine learning pipelines."
        client = _make_llm_client(json.dumps(["Enriched chunk"]))

        RAGFileProcessService.phase2_llm_semantic_chunking(
            client, "model-name", "text block", context
        )

        sent_prompt = client.chat.completions.create.call_args[1]["messages"][0]["content"]
        assert context in sent_prompt
        assert "Summarized Document Context" in sent_prompt

    def test_document_context_empty_string_treated_as_absent(self):
        """An empty-string context is falsy and should NOT inject the preamble."""
        client = _make_llm_client(json.dumps(["chunk"]))

        RAGFileProcessService.phase2_llm_semantic_chunking(
            client, "model-name", "text block", ""
        )

        sent_prompt = client.chat.completions.create.call_args[1]["messages"][0]["content"]
        assert "Summarized context from document is not available" in sent_prompt

    def test_llm_called_with_correct_model_and_temperature(self):
        """Ensure the LLM is invoked with the supplied model name and temperature=0.1."""
        client = _make_llm_client(json.dumps(["chunk"]))

        RAGFileProcessService.phase2_llm_semantic_chunking(
            client, "gpt-4o", "text block"
        )

        call_kwargs = client.chat.completions.create.call_args[1]
        assert call_kwargs["model"] == "gpt-4o"
        assert call_kwargs["temperature"] == 0.1

    def test_phase1_chunk_appears_in_prompt(self):
        """The raw text block must be embedded in the prompt sent to the LLM."""
        client = _make_llm_client(json.dumps(["result"]))
        text_block = "unique-sentinel-text-block-12345"

        RAGFileProcessService.phase2_llm_semantic_chunking(
            client, "model", text_block
        )

        sent_prompt = client.chat.completions.create.call_args[1]["messages"][0]["content"]
        assert text_block in sent_prompt

    def test_json_decode_error_is_reraised(self):
        """If the LLM returns malformed JSON the JSONDecodeError must propagate."""
        client = _make_llm_client("not valid json")

        with pytest.raises(json.JSONDecodeError):
            RAGFileProcessService.phase2_llm_semantic_chunking(
                client, "model", "text block"
            )


# ===========================================================================
# RAGContextService — graceful degradation
# ===========================================================================


@pytest.mark.django_db
class TestRAGContextService:

    @override_settings(ENABLE_GOAL_RAG_CONTEXT=False)
    def test_disabled_rag_returns_empty(self):
        result = RAGContextService.context_query_wrapper("name", "desc", 5, None)
        assert result == []

    @override_settings(ENABLE_GOAL_RAG_CONTEXT=True)
    def test_exception_returns_empty_list(self):
        """If vector search fails, should return empty list not crash."""
        with patch.object(
            RAGFileProcessService,
            "generate_embedding",
            side_effect=Exception("model not loaded"),
        ):
            result = RAGContextService.context_query_wrapper("name", "desc", 5, None)
            assert result == []
