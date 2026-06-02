"""
Define the evaluation metrics for the RAGAS suite.

JudgeLLM wraps the project's Gemini endpoint (exposed via the OpenAI-compatible
API at RAG_LLM_API_URL) so every DeepEval metric uses the same LLM that powers
the production RAG pipeline — no extra credentials needed.
"""

import os
from openai import OpenAI

from deepeval.models import DeepEvalBaseLLM
from deepeval.metrics import (
    AnswerRelevancyMetric,
    FaithfulnessMetric,
    # ContextualPrecisionMetric,
    # ContextualRecallMetric,
    ContextualRelevancyMetric,
)


# ---------------------------------------------------------------------------
# Judge LLM  — wraps Gemini via the OpenAI-compatible endpoint
# ---------------------------------------------------------------------------

class JudgeLLM(DeepEvalBaseLLM):
    """
    A DeepEval-compatible judge that delegates every call to the project's
    configured Gemini model (RAG_LLM_API_URL / RAG_LLM_API_KEY / RAG_LLM_MODEL_NAME).

    The implementation follows the DeepEval custom-model contract:
        https://docs.confident-ai.com/docs/metrics-introduction#using-a-custom-llm
    """

    def __init__(self):
        self.model_name: str = (
            os.environ.get("RAG_LLM_MODEL_NAME") or "gemini-flash-lite-latest"
        )
        api_key: str = os.environ.get("RAG_LLM_API_KEY") or os.environ.get("API_KEY", "")
        base_url: str = (
            os.environ.get("RAG_LLM_API_URL")
            or "https://generativelanguage.googleapis.com/v1beta/openai/"
        )

        self.client = OpenAI(
            api_key=api_key,
            base_url=base_url,
            timeout=180.0,
        )
        # DeepEval 4.x accepts an optional `model` string at init time.
        super().__init__(model=self.model_name)

    # ------------------------------------------------------------------
    # Required DeepEvalBaseLLM interface
    # ------------------------------------------------------------------

    def load_model(self):
        """Return the underlying client (used internally by DeepEval)."""
        return self.client

    def generate(self, prompt: str, **kwargs) -> str:
        """
        Synchronous generation.  DeepEval passes its evaluation prompt as a
        plain string; we forward it to the chat completions endpoint and return
        the text response.
        """
        response = self.client.chat.completions.create(
            model=self.model_name,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.0,   # deterministic judgements for reproducibility
        )
        return response.choices[0].message.content

    async def a_generate(self, prompt: str, **kwargs) -> str:
        """
        Async generation — delegates to the sync version.
        Override with a true async implementation if throughput becomes a concern.
        """
        return self.generate(prompt, **kwargs)

    def get_model_name(self) -> str:
        return self.model_name


# ---------------------------------------------------------------------------
# Pre-built metric instances (threshold = 0.5 — recommended starting point)
# ---------------------------------------------------------------------------
# All five core RAGAS metrics are wired up here so tests can import them
# directly without repeating the boilerplate.

_judge = JudgeLLM()

# Measures whether the answer is grounded in the retrieved context
# (no hallucinations).
faithfulness_metric = FaithfulnessMetric(
    threshold=0.5,
    model=_judge,
    include_reason=True,
)

# Measures whether the answer addresses the question.
answer_relevancy_metric = AnswerRelevancyMetric(
    threshold=0.5,
    model=_judge,
    include_reason=True,
)

# Measures whether the top-ranked retrieved chunks are actually relevant
# (precision of the retriever).
# contextual_precision_metric = ContextualPrecisionMetric(
#     threshold=0.5,
#     model=_judge,
#     include_reason=True,
# )

# Measures whether all relevant information from the expected answer can be
# found in the retrieved context (recall of the retriever).
# contextual_recall_metric = ContextualRecallMetric(
#     threshold=0.5,
#     model=_judge,
#     include_reason=True,
# )

# Measures how relevant the retrieved context chunks are to the question.
contextual_relevancy_metric = ContextualRelevancyMetric(
    threshold=0.5,
    model=_judge,
    include_reason=True,
)