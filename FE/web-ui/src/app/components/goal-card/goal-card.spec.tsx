import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GoalCard } from "./goal-card";
import { goalService, MOCK_GOAL_DETAIL_RESPONSE_DATA } from "@/app/constants";
import { Status } from "@/app/enum/status.enum";
import { ToastProvider } from "@/app/contexts/toast-context/toast-context";
import { ThemeProvider } from "@/app/contexts/theme-context/theme-context";
import { RouteLoadingProvider } from "@/app/contexts/route-loading-context/route-loading-context";
import { GoalProvider } from "@/app/contexts/goal-context/goal-context";

jest.mock("@/app/constants", () => {
  const originalModule = jest.requireActual("@/app/constants");
  return {
    __esModule: true,
    ...originalModule,
    goalService: {
      update: jest.fn(),
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

describe("GoalCard - handleStatusChange", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should update status", async () => {
    (goalService.update as jest.Mock).mockResolvedValueOnce({
      ...MOCK_GOAL_DETAIL_RESPONSE_DATA,
      status: Status.Completed,
    });

    const { id, name, description, deadline, tag, completedCount, taskCount } =
      MOCK_GOAL_DETAIL_RESPONSE_DATA;

    render(
      <RouteLoadingProvider>
        <ThemeProvider>
          <ToastProvider>
            <GoalProvider>
              <GoalCard
                id={id}
                name={name}
                description={description}
                status={MOCK_GOAL_DETAIL_RESPONSE_DATA.status}
                deadline={deadline}
                tag={tag || []}
                completedCount={completedCount}
                taskCount={taskCount}
              />
            </GoalProvider>
          </ToastProvider>
        </ThemeProvider>
      </RouteLoadingProvider>,
    );

    const user = userEvent.setup();

    const trigger = await screen.findByRole("combobox");
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

  it("should update name", async () => {
    (goalService.update as jest.Mock).mockResolvedValueOnce({
      ...MOCK_GOAL_DETAIL_RESPONSE_DATA,
      name: "Updated Goal Name",
    });

    const { id, name, description, deadline, tag, completedCount, taskCount } =
      MOCK_GOAL_DETAIL_RESPONSE_DATA;

    render(
      <RouteLoadingProvider>
        <ThemeProvider>
          <ToastProvider>
            <GoalProvider>
              <GoalCard
                id={id}
                name={name}
                description={description}
                status={MOCK_GOAL_DETAIL_RESPONSE_DATA.status}
                deadline={deadline}
                tag={tag || []}
                completedCount={completedCount}
                taskCount={taskCount}
                isDetailCard
              />
            </GoalProvider>
          </ToastProvider>
        </ThemeProvider>
      </RouteLoadingProvider>,
    );

    const user = userEvent.setup();

    const editButton = await screen.findByTestId("edit-goal-name-button");

    await user.click(editButton);

    const editInput = await screen.findByTestId("edit-goal-name-input");

    await user.clear(editInput);
    await user.type(editInput, "Updated Goal Name");

    editInput.blur();

    expect(goalService.update).toHaveBeenCalledTimes(1);
    expect(goalService.update).toHaveBeenCalledWith(id, {
      name: "Updated Goal Name",
    });
  });
  it("should cancel update name", async () => {
    const { id, name, description, deadline, tag, completedCount, taskCount } =
      MOCK_GOAL_DETAIL_RESPONSE_DATA;

    render(
      <RouteLoadingProvider>
        <ThemeProvider>
          <ToastProvider>
            <GoalProvider>
              <GoalCard
                id={id}
                name={name}
                description={description}
                status={MOCK_GOAL_DETAIL_RESPONSE_DATA.status}
                deadline={deadline}
                tag={tag || []}
                completedCount={completedCount}
                taskCount={taskCount}
                isDetailCard
              />
            </GoalProvider>
          </ToastProvider>
        </ThemeProvider>
      </RouteLoadingProvider>,
    );

    const user = userEvent.setup();

    const editButton = await screen.findByTestId("edit-goal-name-button");

    await user.click(editButton);

    const editInput = await screen.findByTestId("edit-goal-name-input");

    await user.type(editInput, "{Escape}");
    expect(
      await screen.findByText(MOCK_GOAL_DETAIL_RESPONSE_DATA.name),
    ).toBeInTheDocument();
    expect(goalService.update).not.toHaveBeenCalled();
  });

  it("should update deadline", async () => {
    (goalService.update as jest.Mock).mockResolvedValueOnce({
      ...MOCK_GOAL_DETAIL_RESPONSE_DATA,
      deadline: new Date("2100-12-31"),
    });

    const { id, name, description, deadline, tag, completedCount, taskCount } =
      MOCK_GOAL_DETAIL_RESPONSE_DATA;

    render(
      <RouteLoadingProvider>
        <ThemeProvider>
          <ToastProvider>
            <GoalProvider>
              <GoalCard
                id={id}
                name={name}
                description={description}
                status={MOCK_GOAL_DETAIL_RESPONSE_DATA.status}
                deadline={deadline}
                tag={tag || []}
                completedCount={completedCount}
                taskCount={taskCount}
                isDetailCard
              />
            </GoalProvider>
          </ToastProvider>
        </ThemeProvider>
      </RouteLoadingProvider>,
    );

    const user = userEvent.setup();

    const editButton = await screen.findByTestId("edit-goal-deadline-button");

    await user.click(editButton);

    const editInput = await screen.findByTestId("edit-goal-deadline-input");

    await user.clear(editInput);
    await user.type(editInput, "2100-12-31");

    editInput.blur();

    expect(goalService.update).toHaveBeenCalledTimes(1);
    expect(goalService.update).toHaveBeenCalledWith(id, {
      deadline: "2100-12-31",
    });
  });

  it("should cancel update deadline", async () => {
    const { id, name, description, deadline, tag, completedCount, taskCount } =
      MOCK_GOAL_DETAIL_RESPONSE_DATA;

    render(
      <RouteLoadingProvider>
        <ThemeProvider>
          <ToastProvider>
            <GoalProvider>
              <GoalCard
                id={id}
                name={name}
                description={description}
                status={MOCK_GOAL_DETAIL_RESPONSE_DATA.status}
                deadline={deadline}
                tag={tag || []}
                completedCount={completedCount}
                taskCount={taskCount}
                isDetailCard
              />
            </GoalProvider>
          </ToastProvider>
        </ThemeProvider>
      </RouteLoadingProvider>,
    );

    const user = userEvent.setup();

    const editButton = await screen.findByTestId("edit-goal-deadline-button");

    await user.click(editButton);

    const editInput = await screen.findByTestId("edit-goal-deadline-input");

    await user.type(editInput, "{Escape}");
    expect(
      await screen.findByText(
        MOCK_GOAL_DETAIL_RESPONSE_DATA.deadline.toISOString().split("T")[0],
      ),
    ).toBeInTheDocument();
    expect(goalService.update).not.toHaveBeenCalled();
  });

  it("should update tag", async () => {
    (goalService.update as jest.Mock).mockResolvedValueOnce({
      ...MOCK_GOAL_DETAIL_RESPONSE_DATA,
      tag: ["UpdatedTag"],
    });

    const { id, name, description, deadline, tag, completedCount, taskCount } =
      MOCK_GOAL_DETAIL_RESPONSE_DATA;

    render(
      <RouteLoadingProvider>
        <ThemeProvider>
          <ToastProvider>
            <GoalProvider>
              <GoalCard
                id={id}
                name={name}
                description={description}
                status={MOCK_GOAL_DETAIL_RESPONSE_DATA.status}
                deadline={deadline}
                tag={tag || []}
                completedCount={completedCount}
                taskCount={taskCount}
                isDetailCard
              />
            </GoalProvider>
          </ToastProvider>
        </ThemeProvider>
      </RouteLoadingProvider>,
    );

    const user = userEvent.setup();

    const editButton = await screen.findByTestId("edit-goal-tag-button");

    await user.click(editButton);

    const editInput = await screen.findByTestId("edit-goal-tag-input");

    const deleteButton = await screen.findByTestId(
      `edit-goal-tag-delete-0-button`,
    );
    await user.click(deleteButton);

    await user.type(editInput, "UpdatedTag");

    await user.type(editInput, "{Enter}");

    editInput.blur();

    expect(goalService.update).toHaveBeenCalledTimes(1);
    expect(goalService.update).toHaveBeenCalledWith(id, {
      tag: ["goal", "UpdatedTag"],
    });
  });
  it("should cancel update tag", async () => {
    const { id, name, description, deadline, tag, completedCount, taskCount } =
      MOCK_GOAL_DETAIL_RESPONSE_DATA;

    render(
      <RouteLoadingProvider>
        <ThemeProvider>
          <ToastProvider>
            <GoalProvider>
              <GoalCard
                id={id}
                name={name}
                description={description}
                status={MOCK_GOAL_DETAIL_RESPONSE_DATA.status}
                deadline={deadline}
                tag={tag || []}
                completedCount={completedCount}
                taskCount={taskCount}
                isDetailCard
              />
            </GoalProvider>
          </ToastProvider>
        </ThemeProvider>
      </RouteLoadingProvider>,
    );

    const user = userEvent.setup();

    const editButton = await screen.findByTestId("edit-goal-tag-button");

    await user.click(editButton);

    const editInput = await screen.findByTestId("edit-goal-tag-input");

    await userEvent.type(editInput, "{Escape}");

    expect(goalService.update).not.toHaveBeenCalled();
  });

  it("should remove goal", async () => {
    (goalService.remove as jest.Mock).mockResolvedValueOnce(undefined);

    const { id, name, description, deadline, tag, completedCount, taskCount } =
      MOCK_GOAL_DETAIL_RESPONSE_DATA;

    render(
      <RouteLoadingProvider>
        <ThemeProvider>
          <ToastProvider>
            <GoalProvider>
              <GoalCard
                id={id}
                name={name}
                description={description}
                status={MOCK_GOAL_DETAIL_RESPONSE_DATA.status}
                deadline={deadline}
                tag={tag || []}
                completedCount={completedCount}
                taskCount={taskCount}
                isDetailCard
              />
            </GoalProvider>
          </ToastProvider>
        </ThemeProvider>
      </RouteLoadingProvider>,
    );

    const user = userEvent.setup();

    const deleteButton = await screen.findByTestId("delete-goal-button");
    await user.click(deleteButton);

    await user.click(await screen.findByText("Delete"));
    expect(goalService.remove).toHaveBeenCalledTimes(1);
    expect(goalService.remove).toHaveBeenCalledWith(id);
  });
});
