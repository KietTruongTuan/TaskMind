import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider } from "@/app/contexts/theme-context/theme-context";
import { ToastProvider } from "@/app/contexts/toast-context/toast-context";
import { RouteLoadingProvider } from "@/app/contexts/route-loading-context/route-loading-context";
import { goalService, taskService, MOCK_GOAL_DETAIL_RESPONSE_DATA } from "@/app/constants";
import GoalDetailPage from "@/app/tm/workspace/goal/[id]/page";
import { Status } from "../enum/status.enum";

jest.mock("@/app/constants", () => ({
  ...jest.requireActual("@/app/constants"),
  goalService: {
    getById: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  },
  taskService: {
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  },
}));

jest.mock("@/app/hooks/useServerSideService/useServerSideService", () => ({
  useServerSideService: () => ({
    goalService: {
      getById: jest.fn().mockResolvedValue(MOCK_GOAL_DETAIL_RESPONSE_DATA),
    },
  }),
}));

describe("Edit Goal Integration Test", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should successfully edit goal name", async () => {
    const user = userEvent.setup();
    (goalService.update as jest.Mock).mockResolvedValue({});

    const Page = await GoalDetailPage({ params: Promise.resolve({ id: "1" }) });

    render(
      <ThemeProvider>
        <ToastProvider>
          <RouteLoadingProvider>{Page}</RouteLoadingProvider>
        </ToastProvider>
      </ThemeProvider>,
    );

    expect(
      screen.getByText(MOCK_GOAL_DETAIL_RESPONSE_DATA.name),
    ).toBeInTheDocument();

    const editNameBtn = await screen.findByTestId("edit-goal-name-button");
    await user.click(editNameBtn);

    const nameInput = await screen.findByTestId("edit-goal-name-input");
    await user.clear(nameInput);
    await user.type(nameInput, "Updated Goal Name{enter}");

    await waitFor(() => {
      expect(goalService.update).toHaveBeenCalledWith("1", {
        name: "Updated Goal Name",
      });
    });
  });

  it("should successfully edit goal tags", async () => {
    const user = userEvent.setup();
    (goalService.update as jest.Mock).mockResolvedValue({});

    const Page = await GoalDetailPage({ params: Promise.resolve({ id: "1" }) });

    render(
      <ThemeProvider>
        <ToastProvider>
          <RouteLoadingProvider>{Page}</RouteLoadingProvider>
        </ToastProvider>
      </ThemeProvider>,
    );

    const editTagBtn = await screen.findByTestId("edit-goal-tag-button");
    await user.click(editTagBtn);

    const tagInput = await screen.findByTestId("edit-goal-tag-input");
    await user.type(tagInput, "NewTag{enter}");
    await user.tab(); // trigger blur to save

    await waitFor(() => {
      expect(goalService.update).toHaveBeenCalledWith("1", {
        tag: [...(MOCK_GOAL_DETAIL_RESPONSE_DATA.tag || []), "NewTag"],
      });
    });
  });

  it("should handle update failure gracefully", async () => {
    const user = userEvent.setup();
    (goalService.update as jest.Mock).mockRejectedValue({
      message: "Update failed",
    });

    const Page = await GoalDetailPage({ params: Promise.resolve({ id: "1" }) });

    render(
      <ThemeProvider>
        <ToastProvider>
          <RouteLoadingProvider>{Page}</RouteLoadingProvider>
        </ToastProvider>
      </ThemeProvider>,
    );

    const editNameBtn = await screen.findByTestId("edit-goal-name-button");
    await user.click(editNameBtn);

    const nameInput = await screen.findByTestId("edit-goal-name-input");
    await user.clear(nameInput);
    await user.type(nameInput, "Failing Update Name{enter}");

    expect(
      await screen.findByText("Failed to update name"),
    ).toBeInTheDocument();
  });

  it("should successfully edit task name", async () => {
    const user = userEvent.setup();
    (taskService.update as jest.Mock).mockResolvedValue({});

    const Page = await GoalDetailPage({ params: Promise.resolve({ id: "1" }) });

    render(
      <ThemeProvider>
        <ToastProvider>
          <RouteLoadingProvider>{Page}</RouteLoadingProvider>
        </ToastProvider>
      </ThemeProvider>,
    );

    const editTaskNameBtns = await screen.findAllByTestId("edit-task-name-button");
    await user.click(editTaskNameBtns[0]);

    const taskNameInputs = await screen.findAllByTestId("edit-task-name-input");
    await user.clear(taskNameInputs[0]);
    await user.type(taskNameInputs[0], "Updated Task Name{enter}");

    await waitFor(() => {
      expect(taskService.update).toHaveBeenCalledWith("1", {
        name: "Updated Task Name",
      });
    });
  });

  it("should successfully add new task", async () => {
    const user = userEvent.setup();
    (taskService.create as jest.Mock).mockResolvedValue({
      id: "3",
      name: "New Task Name",
      status: Status.ToDo,
      deadline: new Date(),
    });

    const Page = await GoalDetailPage({ params: Promise.resolve({ id: "1" }) });

    render(
      <ThemeProvider>
        <ToastProvider>
          <RouteLoadingProvider>{Page}</RouteLoadingProvider>
        </ToastProvider>
      </ThemeProvider>,
    );

    const addTaskBtn = await screen.findByTestId("add-task-button");
    await user.click(addTaskBtn);

    const newTaskNameInput = await screen.findByTestId("edit-new-task-name-input");
    await user.type(newTaskNameInput, "New Task Name{enter}");

    await waitFor(() => {
      expect(taskService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "New Task Name",
          goalId: "1",
        }),
      );
    });
  });

  it("should successfully delete task", async () => {
    const user = userEvent.setup();
    (taskService.remove as jest.Mock).mockResolvedValue({});

    const Page = await GoalDetailPage({ params: Promise.resolve({ id: "1" }) });

    render(
      <ThemeProvider>
        <ToastProvider>
          <RouteLoadingProvider>{Page}</RouteLoadingProvider>
        </ToastProvider>
      </ThemeProvider>,
    );

    const deleteBtn = await screen.findByTestId("delete-task-0-button");
    await user.click(deleteBtn);

    await waitFor(() => {
      expect(taskService.remove).toHaveBeenCalledWith("1");
    });
  });
});
