import { render, screen } from "@testing-library/react";
import MyGoalPage from "./page";
import { useServerSideService } from "@/app/hooks/useServerSideService/useServerSideService";
import { SearchParams } from "@/app/enum/search-params.enum";
import { MOCK_GOAL_LIST_DATA } from "@/app/constants";
import { RouteLoadingProvider } from "@/app/contexts/route-loading-context/route-loading-context";
import { ThemeProvider } from "@/app/contexts/theme-context/theme-context";
import userEvent from "@testing-library/user-event";
import { MOCK_ROUTER_PUSH } from "../../../../../../jest.setup";
import { WebUrl } from "@/app/enum/web-url.enum";

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
    mockGetAll.mockResolvedValueOnce([]);
    const mockSearchParams = Promise.resolve(
      {} as Record<SearchParams, string | null | undefined>,
    );

    const page = await MyGoalPage({ searchParams: mockSearchParams });
    render(page);
    expect(await screen.findByText("No goal found")).toBeInTheDocument();
  });
  it("should render list of goals", async () => {
    mockGetAll.mockResolvedValueOnce(MOCK_GOAL_LIST_DATA);
    const mockSearchParams = Promise.resolve(
      {} as Record<SearchParams, string | null | undefined>,
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

  it("should go to goal detail when click the goal name", async () => {
    mockGetAll.mockResolvedValueOnce(MOCK_GOAL_LIST_DATA);
    const mockSearchParams = Promise.resolve(
      {} as Record<SearchParams, string | null | undefined>,
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
