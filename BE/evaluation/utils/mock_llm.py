"""
mock_llm.py — Deterministic goal-plan stub for testing.

In production you would swap this for the real call

The stub builds a minimal but plausible plan from the retrieved context so
that Contextual Recall (which checks whether retrieved context supports the
expected output) has a realistic `actual_output` to work against.
"""


def generate_plan(
    goal_name: str,
    goal_description: str,
    context_chunks: list[str],
) -> str:
    """
    Return a simple numbered task list derived from the retrieved context.

    The plan references key phrases from each context chunk so that the
    DeepEval judge can verify grounding without a live LLM call.
    """
    if not context_chunks:
        return (
            f"No relevant context found in the knowledge base for goal '{goal_name}'. "
            "Please add relevant documents and try again."
        )

    header = f"Plan for: {goal_name}\nDescription: {goal_description}\n\nTasks:"
    tasks = []
    for i, chunk in enumerate(context_chunks, start=1):
        # Trim very long propositions to 120 chars for readability
        summary = chunk if len(chunk) <= 120 else chunk[:117] + "..."
        tasks.append(f"  {i}. Based on knowledge: '{summary}'")

    return header + "\n" + "\n".join(tasks)