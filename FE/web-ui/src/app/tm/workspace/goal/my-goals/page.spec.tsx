import { render, screen } from "@testing-library/react";
import MyGoalPage from "./page";
import { useServerSideService } from "@/app/hooks/useServerSideService/useServerSideService";
import { SearchParams } from "@/app/enum/search-params.enum";
import {
  GoalListResponseBody,
  MOCK_GOAL_LIST_DATA,
  MOCK_GOAL_LIST_RESPONSE_DATA_WITH_STATS,
} from "@/app/constants";
import { RouteLoadingProvider } from "@/app/contexts/route-loading-context/route-loading-context";
import { ThemeProvider } from "@/app/contexts/theme-context/theme-context";
import userEvent from "@testing-library/user-event";
import { MOCK_ROUTER_PUSH } from "../../../../../../jest.setup";
import { WebUrl } from "@/app/enum/web-url.enum";
import { useSearchParams } from "next/navigation";
import { Status } from "@/app/enum/status.enum";

jest.mock("@/app/hooks/useServerSideService/useServerSideService", () => ({
  useServerSideService: jest.fn(),
}));

describe("MyGoalPage", () => {
  const mockGetAll = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useServerSideService as jest.Mock).mockResolvedValue({
      goalService: {
        getAll: mockGetAll,
      },
    });
  });

  it("should render message when there is no goal", async () => {
    (useSearchParams as jest.Mock).mockImplementation(
      () => new URLSearchParams(),
    );
    mockGetAll.mockResolvedValueOnce({
      goals: [],
      totalCount: 0,
      toDoCount: 0,
      inProgressCount: 0,
      completedCount: 0,
      onHoldCount: 0,
      cancelledCount: 0,
      overdueCount: 0,
    } as GoalListResponseBody);
    const mockSearchParams = Promise.resolve(
      {} as Record<SearchParams, string | string[] | null | undefined>,
    );

    const page = await MyGoalPage({ searchParams: mockSearchParams });
    render(
      <ThemeProvider>
        <RouteLoadingProvider>{page}</RouteLoadingProvider>
      </ThemeProvider>,
    );
    expect(await screen.findByText("No goal found")).toBeInTheDocument();
  });

  it("should render list of goals", async () => {
    (useSearchParams as jest.Mock).mockImplementation(
      () => new URLSearchParams(),
    );
    mockGetAll.mockResolvedValueOnce(MOCK_GOAL_LIST_RESPONSE_DATA_WITH_STATS);
    const mockSearchParams = Promise.resolve(
      {} as Record<SearchParams, string | string[] | null | undefined>,
    );

    const page = await MyGoalPage({ searchParams: mockSearchParams });
    render(
      <ThemeProvider>
        <RouteLoadingProvider>{page}</RouteLoadingProvider>
      </ThemeProvider>,
    );
    expect(await screen.findByText("Test Goal 1")).toBeInTheDocument();
    expect(await screen.findByText("Test Goal 2")).toBeInTheDocument();
  });

  it("should render list of filtered goals", async () => {
    (useSearchParams as jest.Mock).mockImplementation(
      () => new URLSearchParams(),
    );
    mockGetAll.mockResolvedValueOnce(MOCK_GOAL_LIST_RESPONSE_DATA_WITH_STATS);
    const mockSearchParams = Promise.resolve({
      [SearchParams.Status]: [Status.ToDo, Status.OnHold],
    } as Record<SearchParams, string | string[] | null | undefined>);

    const page = await MyGoalPage({ searchParams: mockSearchParams });
    render(
      <ThemeProvider>
        <RouteLoadingProvider>{page}</RouteLoadingProvider>
      </ThemeProvider>,
    );
    expect(await screen.findByText("Test Goal 1")).toBeInTheDocument();
    expect(await screen.findByText("Test Goal 2")).toBeInTheDocument();
  });

  it("should go to goal detail when click the goal name", async () => {
    (useSearchParams as jest.Mock).mockImplementation(
      () => new URLSearchParams(),
    );
    mockGetAll.mockResolvedValueOnce(MOCK_GOAL_LIST_RESPONSE_DATA_WITH_STATS);
    const mockSearchParams = Promise.resolve(
      {} as Record<SearchParams, string | string[] | null | undefined>,
    );

    const page = await MyGoalPage({ searchParams: mockSearchParams });
    render(
      <ThemeProvider>
        <RouteLoadingProvider>{page}</RouteLoadingProvider>
      </ThemeProvider>,
    );
    const testGoal1 = await screen.findByText(MOCK_GOAL_LIST_DATA[0].name);
    await userEvent.click(testGoal1);
    expect(MOCK_ROUTER_PUSH).toHaveBeenCalledWith(
      `${WebUrl.GoalDetail}/${MOCK_GOAL_LIST_DATA[0].id}`,
    );
  });
});
