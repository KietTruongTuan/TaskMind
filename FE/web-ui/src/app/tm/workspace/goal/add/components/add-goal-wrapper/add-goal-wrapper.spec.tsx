import { render, screen, fireEvent } from "@testing-library/react";
import { AddGoalWrapper } from "./add-goal-wrapper";
import { useGoalContext } from "@/app/contexts/goal-context/goal-context";
import { AddStep } from "@/app/enum/step.enum";
import {
  GoalDetailResponseBody,
  MOCK_GOAL_RESPONSE_DATA,
} from "@/app/constants";

jest.mock("@/app/contexts/goal-context/goal-context", () => ({
  useGoalContext: jest.fn(),
}));

jest.mock("../goal-add/goal-add", () => ({
  GoalAdd: ({ setStep }: { setStep: (step: AddStep) => void }) => (
    <div data-testid="goal-add">
      Goal Add Component
      <button
        data-testid="go-to-review-btn"
        onClick={() => setStep(AddStep.ReviewDetail)}
      >
        Next Step
      </button>
    </div>
  ),
}));

jest.mock("../goal-review/goal-review", () => ({
  GoalReview: ({ goalData }: { goalData: GoalDetailResponseBody }) => (
    <div data-testid="goal-review">Goal Review Component - {goalData.name}</div>
  ),
}));

describe("AddGoalWrapper", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render GoalAdd by default", () => {
    (useGoalContext as jest.Mock).mockReturnValue({ draftGoal: null });

    render(<AddGoalWrapper />);

    expect(screen.getByTestId("goal-add")).toBeInTheDocument();
    expect(screen.queryByTestId("goal-review")).not.toBeInTheDocument();
  });

  it("should transition to GoalReview when step changes AND draftGoal exists", () => {
    (useGoalContext as jest.Mock).mockReturnValue({
      draftGoal: MOCK_GOAL_RESPONSE_DATA,
    });

    render(<AddGoalWrapper />);

    expect(screen.getByTestId("goal-add")).toBeInTheDocument();

    const nextButton = screen.getByTestId("go-to-review-btn");
    fireEvent.click(nextButton);

    expect(screen.queryByTestId("goal-add")).not.toBeInTheDocument();
    expect(screen.getByTestId("goal-review")).toBeInTheDocument();
    expect(
      screen.getByText("Goal Review Component - Test Goal"),
    ).toBeInTheDocument();
  });

  it("should render nothing (null) if step is ReviewDetail but draftGoal is null", () => {
    (useGoalContext as jest.Mock).mockReturnValue({ draftGoal: null });

    const { container } = render(<AddGoalWrapper />);

    const nextButton = screen.getByTestId("go-to-review-btn");
    fireEvent.click(nextButton);

    expect(screen.queryByTestId("goal-add")).not.toBeInTheDocument();
    expect(screen.queryByTestId("goal-review")).not.toBeInTheDocument();

    expect(container).toBeEmptyDOMElement();
  });
});
