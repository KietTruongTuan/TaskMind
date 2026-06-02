"""
evaluation/conftest.py
======================
pytest configuration for the evaluation suite.

Why we override ``django_db_setup``
------------------------------------
The evaluation tests are *integration* tests that run the full RAG pipeline
against real, pre-ingested documents.  The standard pytest-django behaviour
creates a fresh, empty ``test_<dbname>`` database for every test run which
means:

* User accounts created through the admin panel do not exist.
* DocumentChunk rows produced by the ingestion pipeline do not exist.
* All RAG context retrieval returns empty lists → every metric scores 0.0.

By overriding ``django_db_setup`` with a no-op we tell pytest-django to
**skip test-database creation** and use the real database as-is.

Trade-offs:
* Tests can read (and potentially write) real data — keep them read-only.
* Parallel test runs with ``-n`` workers may conflict; run single-threaded.
"""

import pytest


@pytest.fixture(scope="session")
def django_db_setup():
    """
    No-op override: skip test-database creation and use the real database.

    This is intentional for the evaluation suite, which requires real
    ingested documents and user accounts to be present.
    """
    pass
