import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GoalReview } from "./goal-review";
import { AddStep } from "@/app/enum/step.enum";
import {
  goalService,
  MOCK_BLANK_GOAL_RESPONSE_DATA,
  MOCK_GOAL_RESPONSE_DATA,
} from "@/app/constants";
import { RouteLoadingProvider } from "@/app/contexts/route-loading-context/route-loading-context";
import { ToastProvider } from "@/app/contexts/toast-context/toast-context";
import { ThemeProvider } from "@/app/contexts/theme-context/theme-context";

jest.mock("@/app/constants", () => ({
  ...jest.requireActual("@/app/constants"),
  goalService: {
    save: jest.fn(),
  },
}));

describe("GoalReview", () => {
  const mockSetStep = jest.fn();
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render goal details correctly", async () => {
    render(
      <ThemeProvider>
        <ToastProvider>
          <RouteLoadingProvider>
            <GoalReview
              setStep={mockSetStep}
              goalData={MOCK_GOAL_RESPONSE_DATA}
            />
          </RouteLoadingProvider>
        </ToastProvider>
      </ThemeProvider>,
    );

    expect(
      await screen.findByText(MOCK_GOAL_RESPONSE_DATA.name),
    ).toBeInTheDocument();
    expect(
      await screen.findByText(MOCK_GOAL_RESPONSE_DATA.description),
    ).toBeInTheDocument();

    expect(await screen.findByText("Task 1")).toBeInTheDocument();
    expect(await screen.findByText("Task 2")).toBeInTheDocument();
  });

  it("should render blank goal details correctly", async () => {
    render(
      <ThemeProvider>
        <ToastProvider>
          <RouteLoadingProvider>
            <GoalReview
              setStep={mockSetStep}
              goalData={MOCK_BLANK_GOAL_RESPONSE_DATA}
              isDraft
            />
          </RouteLoadingProvider>
        </ToastProvider>
      </ThemeProvider>,
    );

    expect(await screen.findByText("Cancel")).toBeInTheDocument();
  });

  it("should navigate back to FillInformation step when Cancel is clicked", async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider>
        <ToastProvider>
          <RouteLoadingProvider>
            <GoalReview
              setStep={mockSetStep}
              goalData={MOCK_GOAL_RESPONSE_DATA}
              isDraft
            />
          </RouteLoadingProvider>
        </ToastProvider>
      </ThemeProvider>,
    );

    const cancelButton = screen.getByRole("button", { name: /cancel/i });
    await user.click(cancelButton);

    expect(mockSetStep).toHaveBeenCalledWith(AddStep.FillInformation);
  });

  it("should save the goal", async () => {
    const user = userEvent.setup();
    (goalService.save as jest.Mock).mockResolvedValueOnce(
      MOCK_GOAL_RESPONSE_DATA,
    );
    render(
      <ThemeProvider>
        <ToastProvider>
          <RouteLoadingProvider>
            <GoalReview
              setStep={mockSetStep}
              goalData={MOCK_GOAL_RESPONSE_DATA}
              isDraft
            />
          </RouteLoadingProvider>
        </ToastProvider>
      </ThemeProvider>,
    );

    const saveButton = screen.getByRole("button", { name: /save/i });
    await user.click(saveButton);

    expect(goalService.save).toHaveBeenCalledWith(MOCK_GOAL_RESPONSE_DATA);
    expect(
      await screen.findByText("Your goal is successfully saved"),
    ).toBeInTheDocument();
  });
});
