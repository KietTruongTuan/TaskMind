import { render, screen } from "@testing-library/react";
import { TaskListItem } from "./task-list-item";
import { Status } from "@/app/enum/status.enum";
import { ThemeProvider } from "@/app/contexts/theme-context/theme-context";
import {
  DraftTask,
  MOCK_TASK_RESPONSE_DATA,
  taskService,
} from "@/app/constants";
import { ToastProvider } from "@/app/contexts/toast-context/toast-context";
import userEvent from "@testing-library/user-event";

jest.mock("@/app/constants", () => {
  const originalModule = jest.requireActual("@/app/constants");
  return {
    __esModule: true,
    ...originalModule,
    taskService: {
      update: jest.fn(),
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

describe("Task list item", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render task list item", async () => {
    const mockTask: DraftTask = {
      name: "Task 1",
      status: Status.Completed,
      deadline: new Date("2026-02-16"),
    };
    render(
      <ThemeProvider>
        <ToastProvider>
          <TaskListItem task={mockTask} />
        </ToastProvider>
      </ThemeProvider>,
    );

    expect(await screen.findByText("Task 1")).toHaveClass("subText");
  });

  it("should update name", async () => {
    (taskService.update as jest.Mock).mockResolvedValueOnce({
      ...MOCK_TASK_RESPONSE_DATA,
      name: "Updated Task Name",
    });

    const { id } = MOCK_TASK_RESPONSE_DATA;

    render(
      <ThemeProvider>
        <ToastProvider>
          <TaskListItem task={MOCK_TASK_RESPONSE_DATA} />
        </ToastProvider>
      </ThemeProvider>,
    );

    const user = userEvent.setup();

    const editButton = await screen.findByTestId("edit-task-name-button");

    await user.click(editButton);

    const editInput = await screen.findByTestId("edit-task-name-input");

    await user.clear(editInput);
    await user.type(editInput, "Updated Task Name");

    editInput.blur();

    expect(taskService.update).toHaveBeenCalledTimes(1);
    expect(taskService.update).toHaveBeenCalledWith(id, {
      name: "Updated Task Name",
    });
  });

  it("should update deadline", async () => {
    (taskService.update as jest.Mock).mockResolvedValueOnce({
      ...MOCK_TASK_RESPONSE_DATA,
      deadline: new Date("2100-02-17"),
    });

    const { id } = MOCK_TASK_RESPONSE_DATA;

    render(
      <ThemeProvider>
        <ToastProvider>
          <TaskListItem task={MOCK_TASK_RESPONSE_DATA} />
        </ToastProvider>
      </ThemeProvider>,
    );

    const user = userEvent.setup();

    const editButton = await screen.findByTestId("edit-task-deadline-button");

    await user.click(editButton);

    const editInput = await screen.findByTestId("edit-task-deadline-input");

    await user.clear(editInput);
    await user.type(editInput, "2100-02-17");

    editInput.blur();

    expect(taskService.update).toHaveBeenCalledTimes(1);
    expect(taskService.update).toHaveBeenCalledWith(id, {
      deadline: "2100-02-17",
    });
  });

  it("should update status", async () => {
    (taskService.update as jest.Mock).mockResolvedValueOnce({
      ...MOCK_TASK_RESPONSE_DATA,
      status: Status.Completed,
    });

    const { id } = MOCK_TASK_RESPONSE_DATA;

    render(
      <ThemeProvider>
        <ToastProvider>
          <TaskListItem task={MOCK_TASK_RESPONSE_DATA} />
        </ToastProvider>
      </ThemeProvider>,
    );

    const user = userEvent.setup();

    const trigger = await screen.findByRole("combobox");
    trigger.focus();
    await user.keyboard("{Enter}");

    const completedOption = await screen.findByRole("option", {
      name: Status.Completed,
    });

    await user.click(completedOption);
    expect(taskService.update).toHaveBeenCalledTimes(1);
    expect(taskService.update).toHaveBeenCalledWith(id, {
      status: Status.Completed,
    });
  });
});
