import { SearchParams } from "@/app/enum/search-params.enum";
import { useServerSideService } from "@/app/hooks/useServerSideService/useServerSideService";
import { useSearchParams } from "next/navigation";
import AllTaskPage from "./page";
import { render, screen, waitFor } from "@testing-library/react";
import { RouteLoadingProvider } from "@/app/contexts/route-loading-context/route-loading-context";
import { ThemeProvider } from "@/app/contexts/theme-context/theme-context";
import { MOCK_TASK_LIST_RESPONSE_DATA } from "@/app/constants";
import { ToastProvider } from "@/app/contexts/toast-context/toast-context";
import { taskService } from "@/app/constants";
import { Status } from "@/app/enum/status.enum";
import userEvent from "@testing-library/user-event";
import { ReactNode } from "react";

interface MockKanbanProps {
  onCardDragEnd: (args: {
    to: { columnId: string; index: number };
    items: Record<string, string[]>;
  }) => void;
  children: (state: {
    columns: string[];
    items: Record<string, string[]>;
    activeId: string | null;
  }) => ReactNode;
  defaultItems: Record<string, string[]>;
}

jest.mock("@/app/hooks/useServerSideService/useServerSideService", () => ({
  useServerSideService: jest.fn(),
}));

jest.mock("@saas-ui-pro/kanban", () => {
  return {
    Kanban: ({ onCardDragEnd, children, defaultItems }: MockKanbanProps) => (
      <div data-testid="kanban-mock">
        <button
          data-testid="trigger-drag-end"
          onClick={() =>
            onCardDragEnd({
              to: { columnId: Status.InProgress, index: 0 },
              items: { [Status.InProgress]: ["1"] },
            })
          }
        >
          Drag
        </button>
        <button
          data-testid="trigger-drag-end-fail"
          onClick={() =>
            onCardDragEnd({
              to: { columnId: Status.InProgress, index: 0 },
              items: {},
            })
          }
        >
          Drag fail
        </button>
        {children({
          columns: Object.keys(defaultItems || {}),
          items: defaultItems || {},
          activeId: null,
        })}
      </div>
    ),
    KanbanColumn: ({ children }: { children: ReactNode }) => (
      <div>{children}</div>
    ),
    KanbanColumnHeader: ({ children }: { children: ReactNode }) => (
      <div>{children}</div>
    ),
    KanbanColumnBody: ({ children }: { children: ReactNode }) => (
      <div>{children}</div>
    ),
    KanbanCard: ({ children }: { children: ReactNode }) => (
      <div>{children}</div>
    ),
    KanbanDragOverlay: ({ children }: { children: ReactNode }) => (
      <div>{children}</div>
    ),
  };
});

jest.mock("@/app/constants", () => {
  const actual = jest.requireActual("@/app/constants");
  return {
    ...actual,
    taskService: {
      ...actual.taskService,
      update: jest.fn(),
    },
  };
});

describe("AllTaskPage", () => {
  const mockGetAll = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useServerSideService as jest.Mock).mockResolvedValue({
      taskService: {
        getAll: mockGetAll,
      },
    });
  });

  it("should render message when there is no task", async () => {
    (useSearchParams as jest.Mock).mockImplementation(
      () => new URLSearchParams(),
    );
    mockGetAll.mockResolvedValueOnce([]);

    const mockSearchParams = Promise.resolve(
      {} as Record<SearchParams, string | string[] | null | undefined>,
    );

    const page = await AllTaskPage({ searchParams: mockSearchParams });

    render(
      <ThemeProvider>
        <RouteLoadingProvider>{page}</RouteLoadingProvider>
      </ThemeProvider>,
    );
    expect(await screen.findByText("No task found")).toBeInTheDocument();
  });

  it("should render tasks as kanban board", async () => {
    (useSearchParams as jest.Mock).mockImplementation(
      () => new URLSearchParams(),
    );
    mockGetAll.mockResolvedValueOnce(MOCK_TASK_LIST_RESPONSE_DATA);

    const mockSearchParams = Promise.resolve(
      {} as Record<SearchParams, string | string[] | null | undefined>,
    );

    const page = await AllTaskPage({ searchParams: mockSearchParams });
    render(
      <ToastProvider>
        <ThemeProvider>
          <RouteLoadingProvider>{page}</RouteLoadingProvider>
        </ThemeProvider>
      </ToastProvider>,
    );
    expect(await screen.findByText("Task 1")).toBeInTheDocument();
  });

  it("should call taskService.update on onCardDragEnd", async () => {
    (useSearchParams as jest.Mock).mockImplementation(
      () => new URLSearchParams(),
    );
    mockGetAll.mockResolvedValueOnce(MOCK_TASK_LIST_RESPONSE_DATA);
    (taskService.update as jest.Mock).mockResolvedValueOnce({});

    const mockSearchParams = Promise.resolve(
      {} as Record<SearchParams, string | string[] | null | undefined>,
    );

    const page = await AllTaskPage({ searchParams: mockSearchParams });
    render(
      <ToastProvider>
        <ThemeProvider>
          <RouteLoadingProvider>{page}</RouteLoadingProvider>
        </ThemeProvider>
      </ToastProvider>,
    );

    const dragButton = await screen.findByTestId("trigger-drag-end");
    await userEvent.click(dragButton);

    await waitFor(() => {
      expect(taskService.update).toHaveBeenCalledWith("1", {
        status: Status.InProgress,
      });
    });
  });

  it("should not call taskService.update on onCardDragEnd", async () => {
    (useSearchParams as jest.Mock).mockImplementation(
      () => new URLSearchParams(),
    );
    mockGetAll.mockResolvedValueOnce(MOCK_TASK_LIST_RESPONSE_DATA);
    (taskService.update as jest.Mock).mockResolvedValueOnce({});

    const mockSearchParams = Promise.resolve(
      {} as Record<SearchParams, string | string[] | null | undefined>,
    );

    const page = await AllTaskPage({ searchParams: mockSearchParams });
    render(
      <ToastProvider>
        <ThemeProvider>
          <RouteLoadingProvider>{page}</RouteLoadingProvider>
        </ThemeProvider>
      </ToastProvider>,
    );

    const dragButton = await screen.findByTestId("trigger-drag-end-fail");
    await userEvent.click(dragButton);

    await waitFor(() => {
      expect(taskService.update).not.toHaveBeenCalled();
    });
  });
});
