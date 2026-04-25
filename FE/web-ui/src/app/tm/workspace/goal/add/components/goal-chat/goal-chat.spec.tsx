import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GoalChat } from "./goal-chat";
import { useGoalContext } from "@/app/contexts/goal-context/goal-context";
import {
  aiService,
  MOCK_GOAL_REQUEST_DATA,
  MOCK_GOAL_RESPONSE_DATA,
} from "@/app/constants";
import { ChatRole } from "@/app/enum/chat-role.enum";

jest.mock("@/app/contexts/goal-context/goal-context", () => ({
  useGoalContext: jest.fn(),
}));

jest.mock("@/app/constants", () => ({
  ...jest.requireActual("@/app/constants"),
  aiService: {
    createGoal: jest.fn(),
  },
}));

describe("GoalChat", () => {
  const mockSetDraftGoal = jest.fn();
  const mockClearDraftGoal = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useGoalContext as jest.Mock).mockReturnValue({
      draftGoal: null,
      createRequest: null,
      setDraftGoal: mockSetDraftGoal,
      clearDraftGoal: mockClearDraftGoal,
      isDraftGoalFromChat: false,
    });
  });

  it("should render Thinking when draftGoal is null", () => {
    render(<GoalChat />);
    expect(screen.getByText("Thinking")).toBeInTheDocument();
  });

  it("should render draftGoal message when draftGoal is provided", () => {
    (useGoalContext as jest.Mock).mockReturnValue({
      draftGoal: {
        ...MOCK_GOAL_RESPONSE_DATA,
        message: "Test message",
      },
      setDraftGoal: mockSetDraftGoal,
      clearDraftGoal: mockClearDraftGoal,
      isDraftGoalFromChat: true,
    });

    render(<GoalChat />);
    expect(screen.getByText("Test message")).toBeInTheDocument();
  });

  it("should render options when draftGoal has options", () => {
    (useGoalContext as jest.Mock).mockReturnValue({
      draftGoal: {
        ...MOCK_GOAL_RESPONSE_DATA,
        message: "Test message",
        options: ["Option 1", "Option 2"],
      },
      setDraftGoal: mockSetDraftGoal,
      clearDraftGoal: mockClearDraftGoal,
      isDraftGoalFromChat: true,
    });

    render(<GoalChat />);
    expect(screen.getByText("Option 1")).toBeInTheDocument();
    expect(screen.getByText("Option 2")).toBeInTheDocument();
  });

  it("should handle user sending a message", async () => {
    const user = userEvent.setup();
    (useGoalContext as jest.Mock).mockReturnValue({
      draftGoal: {
        ...MOCK_GOAL_RESPONSE_DATA,
        message: "Test message",
      },
      createRequest: MOCK_GOAL_REQUEST_DATA,
      setDraftGoal: mockSetDraftGoal,
      clearDraftGoal: mockClearDraftGoal,
      isDraftGoalFromChat: true,
    });

    (aiService.createGoal as jest.Mock).mockResolvedValue({
      ...MOCK_GOAL_RESPONSE_DATA,
      message: "Assistant response",
    });

    render(<GoalChat />);

    const input = screen.getByTestId("goal-chat-input");
    const sendBtn = screen.getByTestId("goal-chat-send");

    await user.type(input, "User message");
    await user.click(sendBtn);

    expect(mockClearDraftGoal).toHaveBeenCalled();
    expect(aiService.createGoal).toHaveBeenCalledWith({
      ...MOCK_GOAL_REQUEST_DATA,
      message: "User message",
      history: [
        {
          role: ChatRole.Assistant,
          content: JSON.stringify({
            ...MOCK_GOAL_RESPONSE_DATA,
            message: "Test message",
          }),
        },
      ],
    });

    await waitFor(() => {
      expect(mockSetDraftGoal).toHaveBeenCalledWith(
        {
          ...MOCK_GOAL_RESPONSE_DATA,
          message: "Assistant response",
          tasks: MOCK_GOAL_RESPONSE_DATA.tasks?.map((t, index) => ({
            ...t,
            index,
          })),
        },
        true,
      );
    });
  });

  it("should send message when clicking an option", async () => {
    const user = userEvent.setup();
    (useGoalContext as jest.Mock).mockReturnValue({
      draftGoal: {
        ...MOCK_GOAL_RESPONSE_DATA,
        message: "Test message",
        options: ["Option Clicked"],
      },
      createRequest: MOCK_GOAL_REQUEST_DATA,
      setDraftGoal: mockSetDraftGoal,
      clearDraftGoal: mockClearDraftGoal,
      isDraftGoalFromChat: true,
    });

    (aiService.createGoal as jest.Mock).mockResolvedValue({
      ...MOCK_GOAL_RESPONSE_DATA,
      message: "AI Response",
    });

    render(<GoalChat />);

    const option = screen.getByText("Option Clicked");
    await user.click(option);

    expect(aiService.createGoal).toHaveBeenCalledWith({
      ...MOCK_GOAL_REQUEST_DATA,
      message: "Option Clicked",
      history: [
        {
          role: ChatRole.Assistant,
          content: JSON.stringify({
            ...MOCK_GOAL_RESPONSE_DATA,
            message: "Test message",
            options: ["Option Clicked"],
          }),
        },
      ],
    });
  });
});
