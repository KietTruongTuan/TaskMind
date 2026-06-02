"""
rag_pipeline_adapter.py
=======================
Thin adapter that wires the TaskMind RAG stack into DeepEval's expected
``(input, actual_output, retrieval_context)`` triple.

Two operating modes
-------------------
development (default)
    Uses ``mock_llm.generate_plan`` — no live LLM calls, no DB access.
    This is what the evaluation test suite uses so it can run offline and
    without a running Django application server.

production / integration
    Swap ``USE_MOCK_LLM = False`` (or set ``EVAL_USE_MOCK=false`` in the
    environment) to route through the real ``RAGContextService`` and
    ``AIGoalGeneratorService``.  Requires Django to be fully set up and a
    live DB connection.
"""

import os
import sys
from pathlib import Path

# ---------------------------------------------------------------------------
# Bootstrap Django so the adapter can be imported from outside manage.py
# (e.g. when running ``pytest`` from the BE/ root without a running server).
# ---------------------------------------------------------------------------
_BE_DIR = Path(__file__).resolve().parents[2]   # …/BE
if str(_BE_DIR) not in sys.path:
    sys.path.insert(0, str(_BE_DIR))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

import django
django.setup()

# ---------------------------------------------------------------------------
# Now safe to import project code
# ---------------------------------------------------------------------------
from apps.knowledge_base.services import RAGContextService
from apps.accounts.models import User
from django.conf import settings

from evaluation.utils.mock_llm import generate_plan

# Set to False to use the real AI generator instead of the mock.
_USE_MOCK_LLM: bool = False

# UUID of a real account whose uploaded documents should be used for eval.
# Override via the EVAL_USER_ID environment variable.
_EVAL_USER_ID: str = "8b8f68d8-3642-4853-b3e5-f8c09080e15b"


def _get_eval_user() -> User | None:
    """Return the User instance for evaluation, or None to fall back to global docs."""
    return User.objects.get(pk=_EVAL_USER_ID)


class TaskMindRAGAdapter:
    """
    Wraps the TaskMind RAG retrieval + generation pipeline for evaluation.

    Parameters
    ----------
    use_mock_llm : bool
        When True (default) the mock LLM is used for ``generate()``.
        Set to False to call the real ``AIGoalGeneratorService``.
    top_k : int
        Number of context chunks to retrieve (mirrors ``TOP_K_CONTEXT``).
    """

    def __init__(self, use_mock_llm: bool = _USE_MOCK_LLM, top_k: int | None = None):
        self.use_mock_llm = use_mock_llm
        self.top_k = top_k or getattr(settings, "TOP_K_CONTEXT", 10)

    # ------------------------------------------------------------------
    # Public interface used by the test suite
    # ------------------------------------------------------------------

    def retrieve(self, goal_name: str, goal_description: str) -> list[str]:
        """
        Return the list of retrieved context chunks for the given goal.

        Uses the account identified by ``EVAL_USER_ID`` (env var) so that
        documents uploaded by that account are included in the retrieval.
        Falls back to global-only docs when the user cannot be found.
        """
        return RAGContextService.context_query_wrapper(
            name=goal_name,
            description=goal_description,
            top_k=self.top_k,
            user=_get_eval_user(),
        )

    def generate(self, goal_name: str, goal_description: str) -> dict:
        """
        Return a dict with:
            ``answer``   - the generated task plan (str)
            ``contexts`` - the retrieved context chunks (list[str])

        In mock mode the plan is built deterministically from the retrieved
        chunks so the DeepEval judge has grounded text to score.
        In production mode the real LLM is called.
        """
        contexts = self.retrieve(goal_name, goal_description)

        if self.use_mock_llm:
            answer = generate_plan(
                goal_name=goal_name,
                goal_description=goal_description,
                context_chunks=contexts,
            )
        else:
            # Real LLM path — import lazily to avoid pulling Django auth
            # dependencies into the default import path.
            from apps.goals.services import AIGoalGeneratorService

            api_key = AIGoalGeneratorService.get_api_key()
            base_url = AIGoalGeneratorService.get_base_url()
            model = AIGoalGeneratorService.get_ai_text_model()

            prompt = AIGoalGeneratorService.build_prompt_for_task(
                name=goal_name,
                description=goal_description,
                deadline="2099-12-31",   # placeholder — not used by the judge
                user=None,
            )
            raw = AIGoalGeneratorService.get_ai_response(
                system_prompt="You are an expert project manager.",
                history=[],
                latest_user_prompt=prompt,
                api_key=api_key,
                base_url=base_url,
                model=model,
            )
            # get_ai_response returns a parsed dict; flatten tasks into text
            tasks = raw.get("tasks", [])
            answer = "\n".join(
                f"Task {i + 1}: {t.get('name', '')}"
                for i, t in enumerate(tasks)
            )

        return {"answer": answer, "contexts": contexts}