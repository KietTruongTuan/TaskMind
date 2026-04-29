import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider } from "@/app/contexts/theme-context/theme-context";
import { ToastProvider } from "@/app/contexts/toast-context/toast-context";
import { RouteLoadingProvider } from "@/app/contexts/route-loading-context/route-loading-context";
import {
  taskService,
  MOCK_TASK_LIST_RESPONSE_DATA_WITH_STATS,
} from "@/app/constants";
import AllTaskPage from "@/app/tm/workspace/task/all-tasks/page";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SidebarProvider } from "@/app/contexts/sidebar-context/sidebar-context";
import { SearchParams } from "@/app/enum/search-params.enum";
import { WebUrl } from "../enum/web-url.enum";
import { MOCK_ROUTER_PUSH } from "../../../jest.setup";

jest.mock("@/app/hooks/useServerSideService/useServerSideService", () => ({
  useServerSideService: () => ({
    taskService: {
      getAll: jest
        .fn()
        .mockResolvedValue(MOCK_TASK_LIST_RESPONSE_DATA_WITH_STATS),
    },
  }),
}));

jest.mock("@/app/constants", () => ({
  ...jest.requireActual("@/app/constants"),
  taskService: {
    update: jest.fn().mockResolvedValue({}),
  },
}));

jest.mock("@saas-ui-pro/kanban", () => {
  const React = require("react");
  return {
    Kanban: ({ children, onCardDragEnd, defaultItems }: any) => {
      const kanbanState = {
        columns: ["ToDo", "InProgress", "OnHold", "Completed", "Cancelled"],
        items: defaultItems,
        activeId: null,
      };
      return (
        <div data-testid="mock-kanban">
          <button
            data-testid="trigger-drag-end"
            onClick={() =>
              onCardDragEnd({
                to: { columnId: "InProgress", index: 0 },
                items: { InProgress: ["1"] },
              })
            }
          >
            Trigger Drag End
          </button>
          {children(kanbanState)}
        </div>
      );
    },
    KanbanColumn: ({ children, id }: any) => (
      <div data-testid={`column-${id}`}>{children}</div>
    ),
    KanbanColumnHeader: ({ children }: any) => <div>{children}</div>,
    KanbanColumnBody: ({ children }: any) => <div>{children}</div>,
    KanbanCard: ({ children, id }: any) => (
      <div data-testid={`card-${id}`}>{children}</div>
    ),
    KanbanDragOverlay: () => <div></div>,
  };
});

describe("Kanban Board Management Integration Test", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (usePathname as jest.Mock).mockReturnValue(`${WebUrl.TaskBoard}`);
    const mockSearchParams = {
      get: jest.fn().mockReturnValue(null),
      getAll: jest.fn().mockReturnValue([]),
    };
    (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
  });

  it("should render tasks correctly in kanban board", async () => {
    const Page = await AllTaskPage({
      searchParams: Promise.resolve(
        {} as Record<SearchParams, string | string[] | undefined>,
      ),
    });
    render(
      <ThemeProvider>
        <SidebarProvider>
          <ToastProvider>
            <RouteLoadingProvider>{Page}</RouteLoadingProvider>
          </ToastProvider>
        </SidebarProvider>
      </ThemeProvider>,
    );

    for (const task of MOCK_TASK_LIST_RESPONSE_DATA_WITH_STATS.tasks) {
      expect(screen.getByText(task.name)).toBeInTheDocument();
    }
  });

  it("should navigate to goal detail when clicking on goal link in task card", async () => {
    const user = userEvent.setup();
    const Page = await AllTaskPage({
      searchParams: Promise.resolve(
        {} as Record<SearchParams, string | string[] | undefined>,
      ),
    });
    render(
      <ThemeProvider>
        <SidebarProvider>
          <ToastProvider>
            <RouteLoadingProvider>{Page}</RouteLoadingProvider>
          </ToastProvider>
        </SidebarProvider>
      </ThemeProvider>,
    );

    const firstTask = MOCK_TASK_LIST_RESPONSE_DATA_WITH_STATS.tasks[0];
    const goalLinks = screen.getAllByText(firstTask.goalName!);
    await user.click(goalLinks[0]);

    await waitFor(() => {
      expect(MOCK_ROUTER_PUSH).toHaveBeenCalledWith(
        expect.stringContaining(`${WebUrl.GoalDetail}/${firstTask.goalId}`),
      );
    });
  });
  it("should update task status on drag end", async () => {
    const user = userEvent.setup();
    const Page = await AllTaskPage({
      searchParams: Promise.resolve(
        {} as Record<SearchParams, string | string[] | undefined>,
      ),
    });

    render(
      <ThemeProvider>
        <SidebarProvider>
          <ToastProvider>
            <RouteLoadingProvider>{Page}</RouteLoadingProvider>
          </ToastProvider>
        </SidebarProvider>
      </ThemeProvider>,
    );

    const triggerBtn = screen.getByTestId("trigger-drag-end");
    await user.click(triggerBtn);

    await waitFor(() => {
      expect(taskService.update).toHaveBeenCalledWith("1", {
        status: "InProgress",
      });
    });
  });
});
