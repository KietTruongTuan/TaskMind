import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider } from "@/app/contexts/theme-context/theme-context";
import { ToastProvider } from "@/app/contexts/toast-context/toast-context";
import { RouteLoadingProvider } from "@/app/contexts/route-loading-context/route-loading-context";
import { MOCK_GOAL_LIST_RESPONSE_DATA_WITH_STATS } from "@/app/constants";
import MyGoalPage from "@/app/tm/workspace/goal/my-goals/page";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SearchParams } from "../enum/search-params.enum";
import { MOCK_ROUTER_PUSH } from "../../../jest.setup";

jest.mock("@/app/hooks/useServerSideService/useServerSideService", () => ({
  useServerSideService: () => ({
    goalService: {
      getAll: jest
        .fn()
        .mockResolvedValue(MOCK_GOAL_LIST_RESPONSE_DATA_WITH_STATS),
      getTags: jest.fn().mockResolvedValue(["test", "goal", "urgent"]),
    },
  }),
}));

describe("Search and Filter Goal List Integration Test", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (usePathname as jest.Mock).mockReturnValue("/tm/workspace/goal/my-goals");
    const mockSearchParams = {
      get: jest.fn().mockReturnValue(null),
      getAll: jest.fn().mockReturnValue([]),
    };
    (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
  });

  it("should trigger search after typing in search bar", async () => {
    const user = userEvent.setup();

    const Page = await MyGoalPage({
      searchParams: Promise.resolve(
        {} as Record<SearchParams, string | string[] | null | undefined>,
      ),
    });
    render(
      <ThemeProvider>
        <ToastProvider>
          <RouteLoadingProvider>{Page}</RouteLoadingProvider>
        </ToastProvider>
      </ThemeProvider>,
    );

    const searchInput = screen.getByPlaceholderText("Search");
    await user.type(searchInput, "Test Goal Search");

    await waitFor(
      () => {
        expect(MOCK_ROUTER_PUSH).toHaveBeenCalledWith(
          expect.stringContaining("search=Test+Goal+Search"),
        );
      },
    );
  });

  it("should trigger filter on selecting tag and clicking filter", async () => {
    const user = userEvent.setup();

    const Page = await MyGoalPage({
      searchParams: Promise.resolve(
        {} as Record<SearchParams, string | string[] | null | undefined>,
      ),
    });
    render(
      <ThemeProvider>
        <ToastProvider>
          <RouteLoadingProvider>{Page}</RouteLoadingProvider>
        </ToastProvider>
      </ThemeProvider>,
    );

    const filterTrigger = screen.getByTestId("filter-dropdown-trigger");
    await user.click(filterTrigger);

    const urgentTag = await screen.findByText("urgent");
    await user.click(urgentTag);

    const filterBtn = screen.getByText("Filter");
    await user.click(filterBtn);

    await waitFor(() => {
      expect(MOCK_ROUTER_PUSH).toHaveBeenCalledWith(
        expect.stringContaining("tag=urgent"),
      );
    });
  });

  it("should render goal list items correctly", async () => {
    const Page = await MyGoalPage({
      searchParams: Promise.resolve(
        {} as Record<SearchParams, string | string[] | null | undefined>,
      ),
    });
    render(
      <ThemeProvider>
        <ToastProvider>
          <RouteLoadingProvider>{Page}</RouteLoadingProvider>
        </ToastProvider>
      </ThemeProvider>,
    );

    for (const goal of MOCK_GOAL_LIST_RESPONSE_DATA_WITH_STATS.goals) {
      expect(screen.getByText(goal.name)).toBeInTheDocument();
    }
  });
});
