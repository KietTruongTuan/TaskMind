import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GoalReview } from "./goal-review";
import {
  MOCK_BLANK_GOAL_RESPONSE_DATA,
  MOCK_GOAL_RESPONSE_DATA,
  taskService,
} from "@/app/constants";
import { RouteLoadingProvider } from "@/app/contexts/route-loading-context/route-loading-context";
import { ToastProvider } from "@/app/contexts/toast-context/toast-context";
import { ThemeProvider } from "@/app/contexts/theme-context/theme-context";
import { Status } from "@/app/enum/status.enum";
import { GoalProvider } from "@/app/contexts/goal-context/goal-context";
import { SidebarProvider } from "@/app/contexts/sidebar-context/sidebar-context";

jest.mock("@/app/constants", () => ({
  ...jest.requireActual("@/app/constants"),
  taskService: {
    update: jest.fn(),
  },
}));

beforeAll(() => {
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };

  if (typeof window !== "undefined" && !window.PointerEvent) {
    class MockPointerEvent extends MouseEvent {
      pointerId: number;
      constructor(type: string, params: PointerEventInit = {}) {
        super(type, params);
        this.pointerId = params.pointerId || 1;
      }
    }
    window.PointerEvent = MockPointerEvent as any;
  }

  window.HTMLElement.prototype.hasPointerCapture = jest.fn();
  window.HTMLElement.prototype.releasePointerCapture = jest.fn();
  window.HTMLElement.prototype.setPointerCapture = jest.fn();

  window.HTMLElement.prototype.scrollIntoView = jest.fn();
});

describe("GoalReview", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render goal details correctly", async () => {
    render(
      <ThemeProvider>
        <ToastProvider>
          <RouteLoadingProvider>
            <GoalProvider>
              <SidebarProvider>
                <GoalReview
                  goalData={MOCK_GOAL_RESPONSE_DATA}
                />
              </SidebarProvider>
            </GoalProvider>
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
            <GoalProvider>
              <SidebarProvider>
                <GoalReview
                  goalData={MOCK_BLANK_GOAL_RESPONSE_DATA}
                  isDraft
                />
              </SidebarProvider>
            </GoalProvider>
          </RouteLoadingProvider>
        </ToastProvider>
      </ThemeProvider>,
    );

    expect(screen.queryByText("Back")).not.toBeInTheDocument();
  });

  it("should update task count when update task status", async () => {
    const user = userEvent.setup();
    (taskService.update as jest.Mock).mockResolvedValueOnce(
      MOCK_GOAL_RESPONSE_DATA,
    );
    render(
      <ThemeProvider>
        <ToastProvider>
          <RouteLoadingProvider>
            <GoalProvider>
              <SidebarProvider>
                <GoalReview
                  goalData={MOCK_GOAL_RESPONSE_DATA}
                />
              </SidebarProvider>
            </GoalProvider>
          </RouteLoadingProvider>
        </ToastProvider>
      </ThemeProvider>,
    );

    const trigger = await screen.findAllByRole("combobox");
    trigger[2].focus();
    await user.keyboard("{Enter}");

    const completedOption = await screen.findByRole("option", {
      name: Status.Completed,
    });

    await user.click(completedOption);

    expect(taskService.update).toHaveBeenCalled();
  });

  it("should search task", async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider>
        <ToastProvider>
          <RouteLoadingProvider>
            <GoalProvider>
              <SidebarProvider>
              <GoalReview
                goalData={MOCK_GOAL_RESPONSE_DATA}
              />
              </SidebarProvider>
            </GoalProvider>
          </RouteLoadingProvider>
        </ToastProvider>
      </ThemeProvider>,
    );

    const boardTab = await screen.findByTestId("tab-trigger-board");
    await user.click(boardTab);

    const searchBar = await screen.findByPlaceholderText("Search");
    await user.type(searchBar, "Task 1");

    await waitFor(
      () => {
        expect(screen.queryByText("Task 2")).not.toBeInTheDocument();
      },
      { timeout: 1000 },
    );

    expect(screen.getByText("Task 1")).toBeInTheDocument();
  });
});
