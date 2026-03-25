import { render, screen } from "@testing-library/react";
import { KanbanItem } from "./kanban-item";
import {
  MOCK_DRAFT_TASK_LIST_RESPONSE_DATA,
  MOCK_TASK_LIST_RESPONSE_DATA,
} from "@/app/constants";
import userEvent from "@testing-library/user-event";
import { MOCK_ROUTER_PUSH } from "../../../../jest.setup";
import { buildUrl } from "@/app/tm/utils";
import { WebUrl } from "@/app/enum/web-url.enum";
import { RouteLoadingProvider } from "@/app/contexts/route-loading-context/route-loading-context";
import { ThemeProvider } from "@/app/contexts/theme-context/theme-context";

describe("Kanban Item", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should route to goal detail when click the goal name", async () => {
    render(
      <ThemeProvider>
        <RouteLoadingProvider>
          <KanbanItem task={MOCK_TASK_LIST_RESPONSE_DATA[0]} />
        </RouteLoadingProvider>
      </ThemeProvider>,
    );
    const goalName = screen.getByText("Goal 1");
    await userEvent.click(goalName);
    expect(MOCK_ROUTER_PUSH).toHaveBeenCalledWith(
      buildUrl(WebUrl.GoalDetail, "1", undefined),
    );
  });

  it("should render draft task", async () => {
    render(
      <ThemeProvider>
        <RouteLoadingProvider>
          <KanbanItem task={MOCK_DRAFT_TASK_LIST_RESPONSE_DATA[0]} />
        </RouteLoadingProvider>
      </ThemeProvider>,
    );
    expect(screen.getByText("Task 1")).toBeInTheDocument();
    expect(screen.getByText("To do")).toBeInTheDocument();
    expect(
      screen.getByText(
        MOCK_DRAFT_TASK_LIST_RESPONSE_DATA[0].deadline
          .toISOString()
          .split("T")[0],
      ),
    ).toBeInTheDocument();
  });
});
