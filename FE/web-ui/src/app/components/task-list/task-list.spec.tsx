import {
  MOCK_DRAFT_TASK_LIST_RESPONSE_DATA,
  MOCK_TASK_LIST_RESPONSE_DATA,
  MOCK_TASK_RESPONSE_DATA,
  taskService,
} from "@/app/constants";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TaskList } from "./task-list";
import { ToastProvider } from "@/app/contexts/toast-context/toast-context";
import { ThemeProvider } from "@/app/contexts/theme-context/theme-context";

jest.mock("@/app/constants", () => {
  const originalModule = jest.requireActual("@/app/constants");
  return {
    __esModule: true,
    ...originalModule,
    taskService: {
      remove: jest.fn(),
    },
  };
});

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

describe("Task list", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should delete task", async () => {
    (taskService.remove as jest.Mock).mockResolvedValueOnce(undefined);

    render(
      <ThemeProvider>
        <ToastProvider>
          <TaskList tasks={MOCK_TASK_LIST_RESPONSE_DATA} />
        </ToastProvider>
      </ThemeProvider>,
    );

    const user = userEvent.setup();

    const deleteButton = await screen.findByTestId("delete-task-0-button");

    await user.click(deleteButton);

    expect(taskService.remove).toHaveBeenCalledTimes(1);
    expect(taskService.remove).toHaveBeenCalledWith(
      MOCK_TASK_LIST_RESPONSE_DATA[0].id,
    );
  });

  it("should delete draftTask", async () => {
    render(
      <ThemeProvider>
        <ToastProvider>
          <TaskList
            tasks={MOCK_DRAFT_TASK_LIST_RESPONSE_DATA}
            onTaskCountChange={() => {}}
          />
        </ToastProvider>
      </ThemeProvider>,
    );

    const user = userEvent.setup();

    const deleteButton = await screen.findByTestId("delete-task-0-button");

    await user.click(deleteButton);

    expect(taskService.remove).not.toHaveBeenCalled();
  });
});
