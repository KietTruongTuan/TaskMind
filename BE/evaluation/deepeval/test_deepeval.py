"""
test_deepeval.py
================
Full RAGAS evaluation suite for the TaskMind RAG pipeline using DeepEval.

Three metrics are measured for every sample in ``datasets/rag_eval.json``:

    Metric                  What it checks
    ─────────────────────── ──────────────────────────────────────────────────
    Faithfulness            Is the answer grounded in the retrieved context?
                            (hallucination detector)
    Answer Relevancy        Does the answer actually address the goal/question?
    Contextual Precision    Are the top-ranked retrieved chunks the useful ones?
    Contextual Recall       Does the context cover everything in the ground truth?
    Contextual Relevancy    Are the retrieved chunks relevant to the goal query?

Each metric is evaluated via ``metric.measure(test_case)`` and the score is
read from ``metric.score``.  Results are collected into a pandas DataFrame:

    test_case | faithfulness | answer_relevancy | contextual_relevancy | status
    ─────────────────────────────────────────────────────────────────────────
    ...       |  0.xx        |  0.xx            |  0.xx                | Passed

Running
-------
From the BE/ directory (with the venv activated):

    # Full evaluation with the real LLM judge
    EVAL_USE_MOCK=false pytest evaluation/deepeval/test_deepeval.py -v

    # Save an HTML report
    pytest evaluation/deepeval/test_deepeval.py -v --html=evaluation/report.html

    # Run standalone — prints + saves evaluation/deepeval/results.csv
    python evaluation/deepeval/test_deepeval.py

Output
------
DeepEval prints a rich table at the end showing per-metric pass/fail.
Individual reasons for each score are included because ``include_reason=True``
is set on every metric.
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

from deepeval.test_case import LLMTestCase

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

_METRICS = [
    faithfulness_metric,
    answer_relevancy_metric,
    contextual_relevancy_metric,
]

_THRESHOLD = 0.5


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
# Shared result accumulator — populated by each parametrised test run.
# The conftest.py pytest_terminal_summary hook reads this list to print the
# full DataFrame once at the very end, regardless of pass/fail status.
# ---------------------------------------------------------------------------
_RESULTS: list[dict] = []


# ---------------------------------------------------------------------------
# Helper: measure all metrics and return a result row dict
# ---------------------------------------------------------------------------

def _measure_sample(sample: dict) -> dict:
    """
    Run the RAG pipeline for *sample*, measure every metric via
    ``metric.measure(test_case)``, and return a result dict::

        {
            "test_case":                        str,
            "faithfulness":                     float | None,
            "faithfulness_reason":              str | None,
            "answer_relevancy":                 float | None,
            "answer_relevancy_reason":          str | None,
            "contextual_relevancy":             float | None,
            "contextual_relevancy_reason":      str | None,
            "status":                           "Passed" | "Failed",
        }

    ``None`` is stored for both score and reason when a metric raises an
    exception (e.g. timeout).
    """
    goal_name: str = sample["goal_name"]
    goal_description: str = sample["goal_description"]
    ground_truth: str = sample["ground_truth"]

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

    scores: dict[str, float | None] = {}
    reasons: dict[str, str | None] = {}
    for metric in _METRICS:
        key = metric.__class__.__name__
        try:
            metric.measure(test_case)
            scores[key] = metric.score
            reasons[key] = getattr(metric, "reason", None)
        except Exception as exc:
            scores[key] = None
            reasons[key] = f"ERROR: {exc}"
            print(f"[WARN] {key} failed for '{goal_name}': {exc}")

    faithfulness_score = scores.get("FaithfulnessMetric")
    answer_relevancy_score = scores.get("AnswerRelevancyMetric")
    contextual_relevancy_score = scores.get("ContextualRelevancyMetric")

    all_scores = [faithfulness_score, answer_relevancy_score, contextual_relevancy_score]
    status = (
        "Passed"
        if all(s is not None and s >= _THRESHOLD for s in all_scores)
        else "Failed"
    )

    return {
        "test_case": goal_name,
        "faithfulness": faithfulness_score,
        "faithfulness_reason": reasons.get("FaithfulnessMetric"),
        "answer_relevancy": answer_relevancy_score,
        "answer_relevancy_reason": reasons.get("AnswerRelevancyMetric"),
        "contextual_relevancy": contextual_relevancy_score,
        "contextual_relevancy_reason": reasons.get("ContextualRelevancyMetric"),
        "status": status,
    }


# ---------------------------------------------------------------------------
# Parametrised pytest test
# ---------------------------------------------------------------------------

@pytest.mark.django_db          # ← grants ORM access for the whole test body
@pytest.mark.parametrize(
    "sample",
    _DATASET,
    ids=[f"{s.get('course', 'unknown')}__{s['goal_name']}" for s in _DATASET],
)
def test_rag_pipeline(sample: dict):
    """
    Measure all three RAGAS metrics for one sample from the evaluation dataset
    using ``metric.measure()`` / ``metric.score``.

    Each row is appended to the module-level ``_RESULTS`` list.  The
    ``pytest_terminal_summary`` hook in ``conftest.py`` then prints the full
    DataFrame (all test cases, passed and failed) once at the very end of the
    session — bypassing pytest's per-test stdout capture.

    The test fails if *any* metric score is None (error/timeout) or falls
    below the threshold (0.5).

    Note on empty retrieval context
    --------------------------------
    ``Contextual Relevancy`` will score 0.0 if no documents have been ingested
    into the global knowledge base.  Upload course-relevant documents via the
    admin panel first for meaningful scores.
    """
    row = _measure_sample(sample)

    # Accumulate for the session-level summary table
    _RESULTS.append(row)

    # Fail the pytest test if status is not Passed
    assert row["status"] == "Passed", (
        f"Metrics below threshold for '{row['test_case']}': "
        f"faithfulness={row['faithfulness']}, "
        f"answer_relevancy={row['answer_relevancy']}, "
        f"contextual_relevancy={row['contextual_relevancy']}"
    )


# ---------------------------------------------------------------------------
# Standalone runner — saves full results to evaluation/deepeval/results.csv
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    import django
    django.setup()

    import pandas as pd

    print(f"\n{'=' * 70}")
    print(f"TaskMind RAG Evaluation — {len(_DATASET)} samples")
    print(f"Mock LLM : {_ADAPTER.use_mock_llm}")
    print(f"Threshold: {_THRESHOLD}")
    print(f"{'=' * 70}\n")

    rows = []
    for s in _DATASET:
        print(f"    Evaluating: {s.get('course', '?')} — {s['goal_name']} …")
        rows.append(_measure_sample(s))

    df = pd.DataFrame(rows, columns=[
        "test_case",
        "faithfulness",
        "answer_relevancy",
        "contextual_relevancy",
        "status",
    ])

    print(f"\n{'=' * 70}")
    print("RESULTS")
    print("=" * 70)
    print(df.to_string(index=False))

    # ── Per-test-case reasons ────────────────────────────────────────────────
    print(f"\n{'─' * 70}")
    print("REASONS")
    print(f"{'─' * 70}")
    for row in rows:
        print(f"\n▶ {row['test_case']}  [{row['status']}]")
        print(f"  Faithfulness         ({row['faithfulness']:.4f}): {row['faithfulness_reason']}")
        print(f"  Answer Relevancy     ({row['answer_relevancy']:.4f}): {row['answer_relevancy_reason']}")
        print(f"  Contextual Relevancy ({row['contextual_relevancy']:.4f}): {row['contextual_relevancy_reason']}")

    # Aggregate pass rate
    total = len(df)
    passed = (df["status"] == "Passed").sum()
    print(f"\n{'=' * 70}")
    print(f"Pass rate : {passed}/{total} ({100 * passed / total:.1f} %)")
    print(f"Avg faithfulness         : {df['faithfulness'].mean():.3f}")
    print(f"Avg answer_relevancy     : {df['answer_relevancy'].mean():.3f}")
    print(f"Avg contextual_relevancy : {df['contextual_relevancy'].mean():.3f}")
    print("=" * 70)

    # Save CSV next to this file (scores + reasons)
    _OUT = Path(__file__).parent / "results.csv"
    pd.DataFrame(rows).to_csv(_OUT, index=False)
    print(f"\nResults saved to: {_OUT}")