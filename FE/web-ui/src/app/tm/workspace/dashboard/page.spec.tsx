import { render, screen } from "@testing-library/react";
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

jest.mock("@/app/hooks/useServerSideService/useServerSideService");

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
});
