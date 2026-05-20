"""
Unit tests for Knowledge Base services.

Covers RAGFileProcessService (chunking) and RAGContextService (graceful degradation).
LLM calls are mocked.
"""

import pytest
from unittest.mock import patch, MagicMock
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
