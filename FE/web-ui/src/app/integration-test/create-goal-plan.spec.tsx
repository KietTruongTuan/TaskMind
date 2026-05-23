import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GoalProvider } from "@/app/contexts/goal-context/goal-context";
import { ToastProvider } from "@/app/contexts/toast-context/toast-context";
import {
  aiService,
  goalService,
  MOCK_GOAL_REQUEST_DATA,
  StatusDisplay,
} from "@/app/constants";
import { MOCK_GOAL_RESPONSE_DATA } from "@/app/constants";
import { RouteLoadingProvider } from "@/app/contexts/route-loading-context/route-loading-context";
import { ThemeProvider } from "@/app/contexts/theme-context/theme-context";
import AddGoalPage from "../tm/workspace/goal/add/page";
import { useServerSideService } from "../hooks/useServerSideService/useServerSideService";

jest.mock("@/app/hooks/useServerSideService/useServerSideService", () => ({
  useServerSideService: jest.fn(),
}));

jest.mock("@/app/constants", () => {
  const actual = jest.requireActual("@/app/constants");
  return {
    ...actual,
    aiService: {
      createGoal: jest.fn(),
    },
    goalService: {
      save: jest.fn(),
    },
  };
});

describe("Goal Creation Integration Test", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useServerSideService as jest.Mock).mockResolvedValue({
      authenticationService: {
        getProfile: jest.fn().mockResolvedValue({
          id: "123",
          name: "Test User",
          email: "test@example.com",
          enableLocalKb: true,
          enableGlobalKb: true,
        }),
      },
    });
  });

  it("should successfully go to review step with goal chat and generated goal plan", async () => {
    const user = userEvent.setup();

    const mockResponse = {
      ...MOCK_GOAL_RESPONSE_DATA,
      message: "Here is your generated goal plan!",
    };
    (aiService.createGoal as jest.Mock).mockResolvedValue(mockResponse);
    const AddPage = await AddGoalPage();

    render(
      <ThemeProvider>
        <ToastProvider>
          <GoalProvider>
            <RouteLoadingProvider>{AddPage}</RouteLoadingProvider>
          </GoalProvider>
        </ToastProvider>
      </ThemeProvider>,
    );
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
    });

    expect(screen.getByText(mockResponse.description)).toBeInTheDocument();
    expect(screen.getByText(mockResponse.name)).toBeInTheDocument();
    expect(
      screen.getAllByText(StatusDisplay[mockResponse.status].title)[0],
    ).toBeInTheDocument();
    expect(
      screen.getAllByText(mockResponse.deadline.toISOString().split("T")[0])[0],
    ).toBeInTheDocument();

    mockResponse.tag?.map((tag) => {
      expect(screen.getByText(tag)).toBeInTheDocument();
    });
    expect(
      await screen.findByText("Here is your generated goal plan!"),
    ).toBeInTheDocument();
  }, 10000);

  it("should successfully save the generated goal plan", async () => {
    const user = userEvent.setup();

    const mockResponse = {
      ...MOCK_GOAL_RESPONSE_DATA,
      message: "Here is your generated goal plan!",
    };

    (aiService.createGoal as jest.Mock).mockResolvedValue(mockResponse);
    (goalService.save as jest.Mock).mockResolvedValueOnce(
      MOCK_GOAL_RESPONSE_DATA,
    );
    const AddPage = await AddGoalPage();

    render(
      <ThemeProvider>
        <ToastProvider>
          <GoalProvider>
            <RouteLoadingProvider>{AddPage}</RouteLoadingProvider>
          </GoalProvider>
        </ToastProvider>
      </ThemeProvider>,
    );
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

    const saveButton = screen.getByRole("button", { name: /save/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(goalService.save).toHaveBeenCalled();
    });
  }, 10000);

  it("should fix the generated goal plan base on user feedback", async () => {
    const user = userEvent.setup();

    const mockResponse = {
      ...MOCK_GOAL_RESPONSE_DATA,
      message: "Here is your generated goal plan!",
    };
    const mockFixResponse = {
      ...mockResponse,
      name: "Fixed test goal plan",
      message: "Here is your fixed goal plan!",
    };
    (aiService.createGoal as jest.Mock)
      .mockResolvedValueOnce(mockResponse)
      .mockResolvedValueOnce(mockFixResponse);
    const AddPage = await AddGoalPage();

    render(
      <ThemeProvider>
        <ToastProvider>
          <GoalProvider>
            <RouteLoadingProvider>{AddPage}</RouteLoadingProvider>
          </GoalProvider>
        </ToastProvider>
      </ThemeProvider>,
    );

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

    const chatInput = await screen.findByTestId("goal-chat-input");
    const chatSendBtn = await screen.findByTestId("goal-chat-send");

    await user.type(chatInput, "Fix the goal plan");
    await user.click(chatSendBtn);

    await waitFor(() => {
      expect(aiService.createGoal).toHaveBeenCalled();
    });

    expect(screen.getByText(mockFixResponse.description)).toBeInTheDocument();
    expect(screen.getByText(mockFixResponse.name)).toBeInTheDocument();
    expect(
      screen.getAllByText(StatusDisplay[mockFixResponse.status].title)[0],
    ).toBeInTheDocument();
    expect(
      screen.getAllByText(
        mockFixResponse.deadline.toISOString().split("T")[0],
      )[0],
    ).toBeInTheDocument();

    mockFixResponse.tag?.map((tag) => {
      expect(screen.getByText(tag)).toBeInTheDocument();
    });
    expect(
      await screen.findByText("Here is your fixed goal plan!"),
    ).toBeInTheDocument();
  }, 10000);
});
