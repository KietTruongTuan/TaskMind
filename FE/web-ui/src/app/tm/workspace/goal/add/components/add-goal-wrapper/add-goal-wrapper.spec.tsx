import { render, screen } from "@testing-library/react";
import { AddGoalWrapper } from "./add-goal-wrapper";
import { useGoalContext } from "@/app/contexts/goal-context/goal-context";
import { AddStep } from "@/app/enum/step.enum";
import {
  GoalDetailResponseBody,
  MOCK_GOAL_RESPONSE_DATA,
  MOCK_USER,
} from "@/app/constants";
import userEvent from "@testing-library/user-event";
import { RouteLoadingProvider } from "@/app/contexts/route-loading-context/route-loading-context";
import { ToastProvider } from "@/app/contexts/toast-context/toast-context";
import { ThemeProvider } from "@/app/contexts/theme-context/theme-context";

jest.mock("@/app/contexts/goal-context/goal-context", () => ({
  useGoalContext: jest.fn(),
}));

jest.mock("@mui/material/useMediaQuery", () => ({
  __esModule: true,
  default: jest.fn(),
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
  const mockUseMediaQuery = jest.requireMock("@mui/material/useMediaQuery")
    .default as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseMediaQuery.mockReturnValue(false);
  });

  it("should render GoalAdd by default", () => {
    (useGoalContext as jest.Mock).mockReturnValue({
      draftGoal: null,
      setAbortController: jest.fn(),
    });

    render(
      <ThemeProvider>
        <ToastProvider>
          <RouteLoadingProvider>
            <AddGoalWrapper userProfile={MOCK_USER} />
          </RouteLoadingProvider>
        </ToastProvider>
      </ThemeProvider>,
    );

    expect(screen.getByTestId("goal-add")).toBeInTheDocument();
    expect(screen.queryByTestId("goal-review")).not.toBeInTheDocument();
  });

  it("should navigate back to FillInformation step when back button is clicked", async () => {
    (useGoalContext as jest.Mock).mockReturnValue({
      draftGoal: MOCK_GOAL_RESPONSE_DATA,
      clearDraftGoal: jest.fn(),
      setAbortController: jest.fn(),
    });

    render(
      <ThemeProvider>
        <ToastProvider>
          <RouteLoadingProvider>
            <AddGoalWrapper userProfile={MOCK_USER} />
          </RouteLoadingProvider>
        </ToastProvider>
      </ThemeProvider>,
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
      setAbortController: jest.fn(),
    });

    render(
      <ThemeProvider>
        <ToastProvider>
          <RouteLoadingProvider>
            <AddGoalWrapper userProfile={MOCK_USER} />
          </RouteLoadingProvider>
        </ToastProvider>
      </ThemeProvider>,
    );

    const nextButton = screen.getByTestId("go-to-review-btn");
    await userEvent.click(nextButton);

    expect(screen.queryByTestId("goal-add")).not.toBeInTheDocument();
    expect(screen.getByTestId("goal-review")).toBeInTheDocument();
    expect(
      screen.getByText("Goal Review Component - Test Goal"),
    ).toBeInTheDocument();
  });

  it("should display the Both menu item on desktop and switch to Both view", async () => {
    mockUseMediaQuery.mockReturnValue(true);
    (useGoalContext as jest.Mock).mockReturnValue({
      draftGoal: MOCK_GOAL_RESPONSE_DATA,
      clearDraftGoal: jest.fn(),
      setAbortController: jest.fn(),
    });

    render(
      <ThemeProvider>
        <ToastProvider>
          <RouteLoadingProvider>
            <AddGoalWrapper userProfile={MOCK_USER} />
          </RouteLoadingProvider>
        </ToastProvider>
      </ThemeProvider>,
    );

    await userEvent.click(screen.getByTestId("go-to-review-btn"));
    await userEvent.click(screen.getByTestId("view-trigger"));

    expect(await screen.findByText("Both")).toBeInTheDocument();
    await userEvent.click(screen.getByText("Both"));

    expect(screen.getByTestId("goal-review")).toBeInTheDocument();
    expect(screen.getByTestId("goal-chat-message-container")).toBeVisible();
  });

  it("should switch to Chat view when Chat menu item is selected", async () => {
    mockUseMediaQuery.mockReturnValue(true);
    (useGoalContext as jest.Mock).mockReturnValue({
      draftGoal: MOCK_GOAL_RESPONSE_DATA,
      clearDraftGoal: jest.fn(),
      setAbortController: jest.fn(),
    });

    render(
      <ThemeProvider>
        <ToastProvider>
          <RouteLoadingProvider>
            <AddGoalWrapper userProfile={MOCK_USER} />
          </RouteLoadingProvider>
        </ToastProvider>
      </ThemeProvider>,
    );

    await userEvent.click(screen.getByTestId("go-to-review-btn"));
    await userEvent.click(screen.getByTestId("view-trigger"));
    await userEvent.click(screen.getByText("Chat"));

    expect(screen.getByTestId("goal-chat-message-container")).toBeVisible();
    expect(screen.getByTestId("goal-review")).not.toBeVisible();
  });

  it("should render chat generating view if step is ReviewDetail but draftGoal is null", async () => {
    (useGoalContext as jest.Mock).mockReturnValue({
      draftGoal: null,
      setAbortController: jest.fn(),
    });

    render(
      <ThemeProvider>
        <ToastProvider>
          <RouteLoadingProvider>
            <AddGoalWrapper userProfile={MOCK_USER} />
          </RouteLoadingProvider>
        </ToastProvider>
      </ThemeProvider>,
    );

    const nextButton = screen.getByTestId("go-to-review-btn");
    await userEvent.click(nextButton);

    expect(screen.queryByTestId("goal-add")).not.toBeInTheDocument();
    expect(screen.queryByTestId("goal-review")).not.toBeInTheDocument();

    expect(screen.getByText("Generating")).toBeInTheDocument();
  });
});
