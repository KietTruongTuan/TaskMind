"""
evaluation/deepeval/conftest.py
================================
pytest plugin hooks specific to the DeepEval evaluation suite.

``pytest_terminal_summary``
---------------------------
Prints a combined pandas DataFrame of ALL evaluated test cases (passed and
failed) at the very end of the test session.  This bypasses pytest's per-test
stdout capture, which would otherwise only show output for failing tests.

The DataFrame is also saved as ``evaluation/deepeval/results.csv`` so results
are persisted between runs.
"""

from __future__ import annotations

import pytest


def pytest_terminal_summary(terminalreporter, exitstatus, config):
    """
    Hook called once after all tests finish and the short summary is printed.

    Reads the ``_RESULTS`` list populated by ``test_deepeval.test_rag_pipeline``
    and renders it as a pandas DataFrame directly to the terminal reporter.
    """
    # Import lazily — only used when this conftest is active.
    try:
        import pandas as pd
    except ImportError:
        terminalreporter.write_line(
            "[RAG Eval] pandas not installed — skipping results table.", yellow=True
        )
        return

    # Pull the accumulated results from the test module (if it was collected).
    try:
        from evaluation.deepeval.test_deepeval import _RESULTS
    except ImportError:
        return  # test module wasn't loaded in this session

    if not _RESULTS:
        return  # no test cases ran (e.g., all deselected)

    df = pd.DataFrame(_RESULTS, columns=[
        "test_case",
        "faithfulness",
        "answer_relevancy",
        "contextual_relevancy",
        "status",
    ])

    # ── Scores table ─────────────────────────────────────────────────────────
    score_cols = ["test_case", "faithfulness", "answer_relevancy", "contextual_relevancy", "status"]
    sep = "=" * 78
    thin = "─" * 78
    terminalreporter.write_line("")
    terminalreporter.write_line(sep)
    terminalreporter.write_line("RAG EVALUATION RESULTS — SCORES", bold=True)
    terminalreporter.write_line(sep)
    terminalreporter.write_line(df[score_cols].to_string(index=False))
    terminalreporter.write_line("")

    # ── Aggregate stats ───────────────────────────────────────────────────────
    total = len(df)
    passed = (df["status"] == "Passed").sum()
    terminalreporter.write_line(
        f"Pass rate              : {passed}/{total} ({100 * passed / total:.1f} %)"
    )
    for col in ("faithfulness", "answer_relevancy", "contextual_relevancy"):
        avg = df[col].mean()
        label = f"Avg {col:<22}"
        terminalreporter.write_line(f"{label}: {avg:.4f}")
    terminalreporter.write_line(sep)

    # ── Per-test-case reasons ─────────────────────────────────────────────────
    terminalreporter.write_line("")
    terminalreporter.write_line(thin)
    terminalreporter.write_line("RAG EVALUATION RESULTS — REASONS", bold=True)
    terminalreporter.write_line(thin)
    for row in _RESULTS:
        status_tag = "PASSED" if row["status"] == "Passed" else "FAILED"
        terminalreporter.write_line(f"\n▶ {row['test_case']}  [{status_tag}]")
        for metric, key in (
            ("Faithfulness        ", "faithfulness"),
            ("Answer Relevancy    ", "answer_relevancy"),
            ("Contextual Relevancy", "contextual_relevancy"),
        ):
            score = row[key]
            reason = row.get(f"{key}_reason") or "N/A"
            score_str = f"{score:.4f}" if score is not None else " None"
            terminalreporter.write_line(f"  {metric} ({score_str}): {reason}")
    terminalreporter.write_line(thin)

    # ── Save CSV (scores + reasons) ───────────────────────────────────────────
    from pathlib import Path
    _OUT = Path(__file__).parent / "results.csv"
    df.to_csv(_OUT, index=False)
    terminalreporter.write_line(f"Results saved to: {_OUT}")
    terminalreporter.write_line("")
