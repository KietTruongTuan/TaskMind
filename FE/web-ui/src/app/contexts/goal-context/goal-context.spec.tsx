import { renderHook, act } from "@testing-library/react";
import { GoalProvider, useGoalContext } from "./goal-context";
import { CreateGoalResponseBody, MOCK_GOAL_RESPONSE_DATA } from "@/app/constants";

describe("GoalContext", () => {
  it("should throw an error when used outside of GoalProvider", () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    expect(() => {
      renderHook(() => useGoalContext());
    }).toThrow("useGoalContext must be used inside GoalProvider");

    consoleSpy.mockRestore();
  });

  it("should initialize with draftGoal as null", () => {
    const { result } = renderHook(() => useGoalContext(), {
      wrapper: GoalProvider,
    });

    expect(result.current.draftGoal).toBeNull();
  });

  it("should update draftGoal when setDraftGoal is called", () => {
    const { result } = renderHook(() => useGoalContext(), {
      wrapper: GoalProvider,
    });

    // act() is required for state updates in React Testing Library
    act(() => {
      result.current.setDraftGoal(MOCK_GOAL_RESPONSE_DATA);
    });

    expect(result.current.draftGoal).toEqual(MOCK_GOAL_RESPONSE_DATA);
  });

  it("should reset draftGoal to null when clearDraftGoal is called", () => {
    const { result } = renderHook(() => useGoalContext(), {
      wrapper: GoalProvider,
    });

    // First, set a goal
    act(() => {
      result.current.setDraftGoal(MOCK_GOAL_RESPONSE_DATA);
    });
    expect(result.current.draftGoal).not.toBeNull();

    // Then, clear it
    act(() => {
      result.current.clearDraftGoal();
    });

    expect(result.current.draftGoal).toBeNull();
  });
});