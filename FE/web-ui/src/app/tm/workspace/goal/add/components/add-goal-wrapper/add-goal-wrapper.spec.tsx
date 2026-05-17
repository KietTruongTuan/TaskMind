import { render, screen } from "@testing-library/react";
import { AddGoalWrapper } from "./add-goal-wrapper";
import { useGoalContext } from "@/app/contexts/goal-context/goal-context";
import { AddStep } from "@/app/enum/step.enum";
import {
  GoalDetailResponseBody,
  MOCK_GOAL_RESPONSE_DATA,
} from "@/app/constants";
import userEvent from "@testing-library/user-event";
import { RouteLoadingProvider } from "@/app/contexts/route-loading-context/route-loading-context";
import { ToastProvider } from "@/app/contexts/toast-context/toast-context";

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

jest.mock("../../../components/goal-review/goal-review", () => ({
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

    render(
      <ToastProvider>
        <RouteLoadingProvider>
          <AddGoalWrapper />
        </RouteLoadingProvider>
      </ToastProvider>,
    );

    expect(screen.getByTestId("goal-add")).toBeInTheDocument();
    expect(screen.queryByTestId("goal-review")).not.toBeInTheDocument();
  });

  it("should navigate back to FillInformation step when back button is clicked", async () => {
    (useGoalContext as jest.Mock).mockReturnValue({
      draftGoal: MOCK_GOAL_RESPONSE_DATA,
      clearDraftGoal: jest.fn(),
    });

    render(
      <ToastProvider>
        <RouteLoadingProvider>
          <AddGoalWrapper />
        </RouteLoadingProvider>
      </ToastProvider>,
    );

    const nextButton = screen.getByTestId("go-to-review-btn");
    await userEvent.click(nextButton);

    const backButton = screen.getByTestId("back-button");
    await userEvent.click(backButton);

    expect(await screen.findByTestId("goal-add")).toBeInTheDocument();
  });

  it("should transition to GoalReview when step changes AND draftGoal exists", async () => {
    (useGoalContext as jest.Mock).mockReturnValue({
      draftGoal: MOCK_GOAL_RESPONSE_DATA,
    });

    render(
      <ToastProvider>
        <RouteLoadingProvider>
          <AddGoalWrapper />
        </RouteLoadingProvider>
      </ToastProvider>,
    );

    const nextButton = screen.getByTestId("go-to-review-btn");
    await userEvent.click(nextButton);

    expect(screen.queryByTestId("goal-add")).not.toBeInTheDocument();
    expect(screen.getByTestId("goal-review")).toBeInTheDocument();
    expect(
      screen.getByText("Goal Review Component - Test Goal"),
    ).toBeInTheDocument();
  });

  it("should render chat generating view if step is ReviewDetail but draftGoal is null", async () => {
    (useGoalContext as jest.Mock).mockReturnValue({ draftGoal: null });

    render(
      <ToastProvider>
        <RouteLoadingProvider>
          <AddGoalWrapper />
        </RouteLoadingProvider>
      </ToastProvider>,
    );

    const nextButton = screen.getByTestId("go-to-review-btn");
    await userEvent.click(nextButton);

    expect(screen.queryByTestId("goal-add")).not.toBeInTheDocument();
    expect(screen.queryByTestId("goal-review")).not.toBeInTheDocument();

    expect(screen.getByText("Generating")).toBeInTheDocument();
  });
});
