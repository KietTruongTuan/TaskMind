from sentence_transformers import SentenceTransformer
import pytest

import os
from django.conf import settings


# ---------------------------------------------------------------------------------------------
#   GENERAL UNIT TESTS CONFIG
# ---------------------------------------------------------------------------------------------

# Force SQLite for all test runs.
# This avoids NeonDB (remote Postgres) teardown failures:
#   - DuplicateDatabase: "test_neondb already exists" (from previous crashed test run)
#   - OperationalError: "database is being accessed by other users" (NeonDB connection pooling)
# Tests run faster and NeonDB stays untouched.
os.environ.setdefault("USE_POSTGRES", "False")


# ---------------------------------------------------------------------------------------------
#   RAGAS 
# ---------------------------------------------------------------------------------------------

# import rag settings
RAG_EMBED_MODEL_NAME = settings.RAG_EMBED_MODEL_NAME
CONTEXT_DISTANCE_THRESHOLD = settings.CONTEXT_DISTANCE_THRESHOLD
TOP_K_CONTEXT = settings.TOP_K_CONTEXT

@pytest.fixture(scope="session")
def embedding_model() -> SentenceTransformer:
    """
    Load the Sentence Transformer model once for the entire test session.
    `scope="session"` avoids the ~1-2 s cold-start cost on every test.
    """
    return SentenceTransformer(RAG_EMBED_MODEL_NAME)