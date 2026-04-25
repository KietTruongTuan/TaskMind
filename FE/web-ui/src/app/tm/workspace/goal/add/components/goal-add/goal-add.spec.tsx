import { render, screen, waitFor } from "@testing-library/react";
import { GoalAdd } from "./goal-add";
import {
  aiService,
  MOCK_GOAL_REQUEST_DATA,
  MOCK_GOAL_RESPONSE_DATA,
} from "@/app/constants";
import userEvent from "@testing-library/user-event";
import { AddStep } from "@/app/enum/step.enum";
import { RouteLoadingProvider } from "@/app/contexts/route-loading-context/route-loading-context";
import { GoalProvider } from "@/app/contexts/goal-context/goal-context";
import { ToastProvider } from "@/app/contexts/toast-context/toast-context";

jest.mock("@/app/constants", () => ({
  ...jest.requireActual("@/app/constants"),
  aiService: {
    createGoal: jest.fn(),
  },
}));

const getPastDate = () => {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 1);
  return date;
};

describe("AddForm", () => {
  const mockSetStep = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should call aiService and move to next step", async () => {
    (aiService.createGoal as jest.Mock).mockResolvedValue(
      MOCK_GOAL_RESPONSE_DATA,
    );
    render(
      <GoalProvider>
        <RouteLoadingProvider>
          <ToastProvider>
            <GoalAdd setStep={mockSetStep} />
          </ToastProvider>
        </RouteLoadingProvider>
      </GoalProvider>,
    );
    const user = userEvent.setup();
    await user.click(await screen.findByTestId("dialog-trigger"));
    const file = [
      new File(["test content"], "test-file-0.pdf", {
        type: "application/pdf",
      }),
      new File(["test content"], "test-file-1.pdf", {
        type: "application/pdf",
      }),
    ];
    const input = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;

    await user.upload(input, file);
    await user.click(await screen.findByTestId("delete-file-button-1"));
    await user.type(
      await screen.findByTestId("name-field"),
      MOCK_GOAL_REQUEST_DATA.name,
    );
    await user.type(
      await screen.findByTestId("description-field"),
      MOCK_GOAL_REQUEST_DATA.description ?? "",
    );
    for (const tag of MOCK_GOAL_REQUEST_DATA.tag ?? []) {
      await user.type(await screen.findByTestId("tag-field"), tag);
      await user.click(await screen.findByTestId("add-tag-button"));
    }

    await user.type(
      await screen.findByTestId("deadline-field"),
      MOCK_GOAL_REQUEST_DATA.deadline.toISOString().split("T")[0],
    );

    const submitButton = await screen.findByTestId("goal-add-button");
    await user.click(submitButton);

    await waitFor(() => {
      expect(aiService.createGoal).toHaveBeenCalled();
      expect(mockSetStep).toHaveBeenCalledWith(AddStep.ReviewDetail);
    });
  });

  it("should show error message when deadline is in the past", async () => {
    render(
      <GoalProvider>
        <RouteLoadingProvider>
          <ToastProvider>
            <GoalAdd setStep={mockSetStep} />
          </ToastProvider>
        </RouteLoadingProvider>
      </GoalProvider>,
    );
    const user = userEvent.setup();

    await user.type(
      await screen.findByTestId("name-field"),
      MOCK_GOAL_REQUEST_DATA.name,
    );
    await user.type(
      await screen.findByTestId("description-field"),
      MOCK_GOAL_REQUEST_DATA.description ?? "",
    );
    for (const tag of MOCK_GOAL_REQUEST_DATA.tag ?? []) {
      await user.type(await screen.findByTestId("tag-field"), tag);
      await user.click(await screen.findByTestId("add-tag-button"));
    }
    await user.type(
      await screen.findByTestId("deadline-field"),
      getPastDate().toISOString().split("T")[0],
    );

    const submitButton = await screen.findByTestId("goal-add-button");
    await user.click(submitButton);
    expect(
      await screen.findByText("Deadline must be in the future"),
    ).toBeInTheDocument();
  });
});
