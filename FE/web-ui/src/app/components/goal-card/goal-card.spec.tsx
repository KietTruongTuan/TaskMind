import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GoalCard } from "./goal-card";
import { goalService, MOCK_GOAL_DETAIL_RESPONSE_DATA } from "@/app/constants";
import { Status } from "@/app/enum/status.enum";
import { ToastProvider } from "@/app/contexts/toast-context/toast-context";
import { ThemeProvider } from "@/app/contexts/theme-context/theme-context";

jest.mock("@/app/constants", () => {
  const originalModule = jest.requireActual("@/app/constants");
  return {
    __esModule: true,
    ...originalModule,
    goalService: {
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

describe("GoalCard - handleStatusChange", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should update status and call goalService.update", async () => {
    (goalService.update as jest.Mock).mockResolvedValueOnce({
      ...MOCK_GOAL_DETAIL_RESPONSE_DATA,
      status: Status.Completed,
    });

    const { id, name, description, deadline, tag, completedCount, taskCount } =
      MOCK_GOAL_DETAIL_RESPONSE_DATA;

    render(
      <ThemeProvider>
        <ToastProvider>
          <GoalCard
            id={id}
            name={name}
            description={description}
            status={MOCK_GOAL_DETAIL_RESPONSE_DATA.status} // Assuming this starts as InProgress or similar
            deadline={deadline}
            tag={tag || []}
            completedCount={completedCount}
            taskCount={taskCount}
          />
        </ToastProvider>
      </ThemeProvider>,
    );

    const user = userEvent.setup();

    const trigger = screen.getByRole("combobox");
    trigger.focus();
    await user.keyboard("{Enter}");

    const completedOption = await screen.findByRole("option", {
      name: Status.Completed,
    });

    await user.click(completedOption);
    expect(goalService.update).toHaveBeenCalledTimes(1);
    expect(goalService.update).toHaveBeenCalledWith(id, {
      status: Status.Completed,
    });
  });
});
