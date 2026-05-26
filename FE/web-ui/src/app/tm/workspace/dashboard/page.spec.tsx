import { render, screen } from "@testing-library/react";
import { Status } from "@/app/enum/status.enum";
import DashboardPage from "./page";
import { TokenRefresherProvider } from "@/app/contexts/token-refresher-context/token-refresher-context";
import { ToastProvider } from "@/app/contexts/toast-context/toast-context";
import { RouteLoadingProvider } from "@/app/contexts/route-loading-context/route-loading-context";
import { ThemeProvider } from "@/app/contexts/theme-context/theme-context";
import { useServerSideService } from "@/app/hooks/useServerSideService/useServerSideService";
import {
  MOCK_GOAL_LIST_RESPONSE_DATA_WITH_STATS,
  MOCK_TASK_LIST_RESPONSE_DATA_WITH_STATS,
} from "@/app/constants";
import { userEvent } from "@testing-library/user-event";

jest.mock("@/app/hooks/useServerSideService/useServerSideService");

jest.mock("@mui/x-charts", () => ({
  PieChart: ({ onItemClick, series }: any) => {
    return (
      <div
        data-testid="mock-pie-chart"
        onClick={(e) => {
          if (onItemClick && series?.[0]?.data) {
            onItemClick(e, { dataIndex: 0 });
          }
        }}
      />
    );
  },
}));

jest.mock("react-activity-calendar", () => {
  return {
    ActivityCalendar: ({
      renderBlock,
    }: {
      renderBlock?: (
        block: React.ReactElement,
        activity: any,
      ) => React.ReactElement;
    }) => {
      let block1, block2;
      if (renderBlock) {
        block1 = renderBlock(<div data-testid="mock-block" />, {
          count: 5,
          date: "2026-08-01",
          level: 1,
        });
        block2 = renderBlock(<div data-testid="mock-block-zero" />, {
          count: 0,
          date: "2026-08-02",
          level: 0,
        });
      }
      return (
        <div data-testid="mock-activity-calendar">
          Mocked Graph
          {block1}
          {block2}
        </div>
      );
    },
  };
});

describe("DashboardPage", () => {
  beforeEach(() => {
    (useServerSideService as jest.Mock).mockResolvedValue({
      goalService: {
        getAll: jest
          .fn()
          .mockResolvedValue(MOCK_GOAL_LIST_RESPONSE_DATA_WITH_STATS),
      },
      taskService: {
        getAll: jest
          .fn()
          .mockResolvedValue(MOCK_TASK_LIST_RESPONSE_DATA_WITH_STATS),
        getProductivity: jest.fn().mockResolvedValue([
          {
            date: "2026-01-01",
            count: 0,
            level: 0,
          },
          {
            date: "2026-4-12",
            count: 3,
            level: 1,
          },
          {
            date: "2026-12-31",
            count: 10,
            level: 2,
          },
        ]),
      },
    });
  });

  it("should render page", async () => {
    const ResolvedDashboardPage = await DashboardPage();
    render(
      <ThemeProvider>
        <RouteLoadingProvider>
          <ToastProvider>
            <TokenRefresherProvider>
              {ResolvedDashboardPage}
            </TokenRefresherProvider>
          </ToastProvider>
        </RouteLoadingProvider>
      </ThemeProvider>,
    );
    expect(
      (await screen.findAllByTestId("recent-list"))[0],
    ).toBeInTheDocument();
    expect(screen.getByTestId("status-card-list")).toBeInTheDocument();
    expect(screen.getByTestId("pie-chart")).toBeInTheDocument();
    expect(screen.getByTestId("contribution-graph")).toBeInTheDocument();
    expect(
      screen.getByText("Today is a wonderful day to achieve your goals."),
    ).toBeInTheDocument();
  });

  it("should filter by status when pie chart is clicked", async () => {
    const ResolvedDashboardPage = await DashboardPage();
    render(
      <ThemeProvider>
        <RouteLoadingProvider>
          <ToastProvider>
            <TokenRefresherProvider>
              {ResolvedDashboardPage}
            </TokenRefresherProvider>
          </ToastProvider>
        </RouteLoadingProvider>
      </ThemeProvider>,
    );

    expect(await screen.findByText("Task 1")).toBeInTheDocument();
    expect(screen.getByText("Task 2")).toBeInTheDocument();

    const mockPieChart = await screen.findByTestId("mock-pie-chart");
    await userEvent.click(mockPieChart);

    expect(screen.getByText("Task 1")).toBeInTheDocument();
    expect(screen.queryByText("Task 2")).not.toBeInTheDocument();

    await userEvent.click(mockPieChart);
    expect(screen.getByText("Task 2")).toBeInTheDocument();
  });

  it("should filter by date when contribution graph is clicked", async () => {
    const ResolvedDashboardPage = await DashboardPage();
    render(
      <ThemeProvider>
        <RouteLoadingProvider>
          <ToastProvider>
            <TokenRefresherProvider>
              {ResolvedDashboardPage}
            </TokenRefresherProvider>
          </ToastProvider>
        </RouteLoadingProvider>
      </ThemeProvider>,
    );

    expect(await screen.findByText("Task 1")).toBeInTheDocument();

    const mockBlock = await screen.findByTestId("mock-block");
    await userEvent.click(mockBlock);

    expect(screen.getByText("No due soon tasks available")).toBeInTheDocument();
    expect(screen.getByText("No recent goals available")).toBeInTheDocument();

    await userEvent.click(mockBlock);
    expect(screen.getByText("Task 1")).toBeInTheDocument();
  });

  it("should sort completed goals properly when some completedDate are missing", async () => {
    (useServerSideService as jest.Mock).mockResolvedValue({
      goalService: {
        getAll: jest.fn().mockResolvedValue({
          ...MOCK_GOAL_LIST_RESPONSE_DATA_WITH_STATS,
          goals: [
            { id: "1", name: "Goal A", status: Status.Completed, completedDate: new Date("2026-01-01"), deadline: new Date() },
            { id: "2", name: "Goal B", status: Status.Completed, deadline: new Date() }, 
            { id: "3", name: "Goal C", status: Status.Completed, completedDate: new Date("2026-05-01"), deadline: new Date() },
            { id: "4", name: "Goal D", status: Status.Completed, deadline: new Date() }, 
          ],
        }),
      },
      taskService: {
        getAll: jest.fn().mockResolvedValue(MOCK_TASK_LIST_RESPONSE_DATA_WITH_STATS),
        getProductivity: jest.fn().mockResolvedValue([]),
      },
    });

    const ResolvedDashboardPage = await DashboardPage();
    render(
      <ThemeProvider>
        <RouteLoadingProvider>
          <ToastProvider>
            <TokenRefresherProvider>
              {ResolvedDashboardPage}
            </TokenRefresherProvider>
          </ToastProvider>
        </RouteLoadingProvider>
      </ThemeProvider>,
    );

    expect(await screen.findByText("Recent Achievements")).toBeInTheDocument();
  });
});
