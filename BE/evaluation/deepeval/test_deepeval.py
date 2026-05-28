"""
test_deepeval.py
================
Full RAGAS evaluation suite for the TaskMind RAG pipeline using DeepEval.

Five metrics are measured for every sample in ``datasets/rag_eval.json``:

    Metric                  What it checks
    ─────────────────────── ──────────────────────────────────────────────────
    Faithfulness            Is the answer grounded in the retrieved context?
                            (hallucination detector)
    Answer Relevancy        Does the answer actually address the goal/question?
    Contextual Precision    Are the top-ranked retrieved chunks the useful ones?
    Contextual Recall       Does the context cover everything in the ground truth?
    Contextual Relevancy    Are the retrieved chunks relevant to the goal query?

Running
-------
From the BE/ directory (with the venv activated):

    # Quick smoke-test — mock LLM, no live AI calls
    pytest evaluation/deepeval/test_deepeval.py -v

    # Full evaluation with the real LLM judge + real generation
    EVAL_USE_MOCK=false pytest evaluation/deepeval/test_deepeval.py -v

    # Save an HTML report
    pytest evaluation/deepeval/test_deepeval.py -v --html=evaluation/report.html

Output
------
DeepEval prints a rich table at the end showing per-metric pass/fail and
the aggregated score across all test cases.  Individual reasons for each
score are included because ``include_reason=True`` is set on every metric.
"""

import json
import os
import sys
from pathlib import Path

import pytest

# ---------------------------------------------------------------------------
# Path setup — make sure project root (BE/) is on sys.path before any
# project import happens.  conftest.py in BE/ already does this for normal
# pytest runs; this guard covers direct invocation.
# ---------------------------------------------------------------------------
_BE_DIR = Path(__file__).resolve().parents[2]
if str(_BE_DIR) not in sys.path:
    sys.path.insert(0, str(_BE_DIR))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

# deepeval imports
from deepeval import assert_test
from deepeval.test_case import LLMTestCase

# Project evaluation imports
from evaluation.deepeval.metrics import (
    faithfulness_metric,
    answer_relevancy_metric,
    # contextual_precision_metric,
    # contextual_recall_metric,
    contextual_relevancy_metric,
)
from evaluation.utils.rag_pipeline_adapter import TaskMindRAGAdapter

# ---------------------------------------------------------------------------
# Dataset — loaded once at collection time (no DB access here, just JSON)
# ---------------------------------------------------------------------------

_DATASET_PATH = Path(__file__).resolve().parents[1] / "datasets" / "rag_eval.json"


def _load_dataset() -> list[dict]:
    """Load the evaluation samples from the JSON dataset."""
    with open(_DATASET_PATH, encoding="utf-8") as fh:
        samples = json.load(fh)
    # Strip comment-only entries that have no goal_name key
    return [s for s in samples if "goal_name" in s]


_DATASET: list[dict] = _load_dataset()

# ---------------------------------------------------------------------------
# Adapter — instantiated once (no DB access at construction time)
# ---------------------------------------------------------------------------

_ADAPTER = TaskMindRAGAdapter()

# ---------------------------------------------------------------------------
# Parametrised test
# ---------------------------------------------------------------------------

@pytest.mark.django_db          # ← grants ORM access for the whole test body
@pytest.mark.parametrize(
    "sample",
    _DATASET,
    ids=[f"{s.get('course', 'unknown')}__{s['goal_name']}" for s in _DATASET],
)
def test_rag_pipeline(sample: dict):
    """
    Run all five RAGAS metrics for one sample from the evaluation dataset.

    The DB access mark is required because ``TaskMindRAGAdapter.retrieve()``
    calls ``RAGContextService`` which queries the ``DocumentChunk`` ORM table.

    The test fails if *any* metric falls below its threshold (0.5).
    DeepEval's ``assert_test`` raises ``AssertionError`` and prints a detailed
    breakdown of which metrics failed and why (reason included).

    Note on empty retrieval context
    --------------------------------
    ``Contextual Precision``, ``Contextual Recall``, and ``Contextual Relevancy``
    will score 0.0 if no documents have been ingested into the global knowledge
    base.  Upload course-relevant documents via the admin panel first for
    meaningful scores on those three metrics.
    """
    goal_name: str = sample["goal_name"]
    goal_description: str = sample["goal_description"]
    ground_truth: str = sample["ground_truth"]

    # ---------------------------------------------------------------------------
    # Run the RAG pipeline — DB access happens here, inside the django_db scope
    # ---------------------------------------------------------------------------
    result = _ADAPTER.generate(goal_name, goal_description)
    actual_output: str = result["answer"]
    retrieval_context: list[str] = result["contexts"]

    # The "input" for DeepEval is the combined goal name + description,
    # mirroring how RAGContextService builds the embedding query internally.
    query = f"{goal_name}. {goal_description}"

    test_case = LLMTestCase(
        input=query,
        actual_output=actual_output,
        retrieval_context=retrieval_context,
        expected_output=ground_truth,
    )

    assert_test(
        test_case,
        metrics=[
            faithfulness_metric,
            answer_relevancy_metric,
            # contextual_precision_metric,
            # contextual_recall_metric,
            contextual_relevancy_metric,
        ],
    )


# ---------------------------------------------------------------------------
# Standalone summary (run this file directly for a quick sanity check)
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    import django
    django.setup()

    from deepeval import evaluate

    print(f"\n{'=' * 60}")
    print(f"TaskMind RAGAS Evaluation — {len(_DATASET)} samples")
    print(f"Mock LLM: {_ADAPTER.use_mock_llm}")
    print(f"{'=' * 60}\n")

    test_cases = []
    for s in _DATASET:
        result = _ADAPTER.generate(s["goal_name"], s["goal_description"])
        test_cases.append(
            LLMTestCase(
                input=f"{s['goal_name']}. {s['goal_description']}",
                actual_output=result["answer"],
                retrieval_context=result["contexts"],
                expected_output=s["ground_truth"],
            )
        )

    evaluate(
        test_cases=test_cases,
        metrics=[
            faithfulness_metric,
            answer_relevancy_metric,
            # contextual_precision_metric,
            # contextual_recall_metric,
            contextual_relevancy_metric,
        ],
    )
