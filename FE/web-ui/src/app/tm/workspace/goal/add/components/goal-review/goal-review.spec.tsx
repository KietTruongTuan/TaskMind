import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GoalReview } from "./goal-review";
import { AddStep } from "@/app/enum/step.enum";
import { MOCK_BLANK_GOAL_RESPONSE_DATA, MOCK_GOAL_RESPONSE_DATA } from "@/app/constants";

describe("GoalReview", () => {
  const mockSetStep = jest.fn();
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render goal details correctly", async () => {
    render(
      <GoalReview setStep={mockSetStep} goalData={MOCK_GOAL_RESPONSE_DATA} />
    );

    expect(
      await screen.findByText(MOCK_GOAL_RESPONSE_DATA.name)
    ).toBeInTheDocument();
    expect(
      await screen.findByText(MOCK_GOAL_RESPONSE_DATA.description)
    ).toBeInTheDocument();

    expect(await screen.findByText("Task 1")).toBeInTheDocument();
    expect(await screen.findByText("Task 2")).toBeInTheDocument();
  });

  it("should render blank goal details correctly", async () => {
    render(
      <GoalReview setStep={mockSetStep} goalData={MOCK_BLANK_GOAL_RESPONSE_DATA} />
    );

    expect(
      await screen.findByText("Cancel")
    ).toBeInTheDocument();
  });

  it("should navigate back to FillInformation step when Cancel is clicked", async () => {
    const user = userEvent.setup();
    render(
      <GoalReview setStep={mockSetStep} goalData={MOCK_GOAL_RESPONSE_DATA} />
    );

    const cancelButton = screen.getByRole("button", { name: /cancel/i });
    await user.click(cancelButton);

    expect(mockSetStep).toHaveBeenCalledWith(AddStep.FillInformation);
  });
});
