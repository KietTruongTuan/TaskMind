import { MOCK_GOAL_DETAIL_RESPONSE_DATA } from "@/app/constants";
import { useServerSideService } from "@/app/hooks/useServerSideService/useServerSideService";
import GoalDetailPage from "./page";
import { render, screen } from "@testing-library/react";
import { RouteLoadingProvider } from "@/app/contexts/route-loading-context/route-loading-context";
import { ToastProvider } from "@/app/contexts/toast-context/toast-context";
import { ThemeProvider } from "@/app/contexts/theme-context/theme-context";

jest.mock("@/app/hooks/useServerSideService/useServerSideService", () => ({
  useServerSideService: jest.fn(),
}));

describe("MyGoalPage", () => {
  const mockGetById = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useServerSideService as jest.Mock).mockResolvedValue({
      goalService: {
        getById: mockGetById,
      },
    });
  });
  it("should render goal detail", async () => {
    mockGetById.mockResolvedValueOnce(MOCK_GOAL_DETAIL_RESPONSE_DATA);
    const mockParams = Promise.resolve({ id: "1" });

    const page = await GoalDetailPage({ params: mockParams });
    render(
      <ThemeProvider>
        <ToastProvider>
          <RouteLoadingProvider>{page}</RouteLoadingProvider>
        </ToastProvider>
      </ThemeProvider>,
    );
    expect(
      await screen.findByText(MOCK_GOAL_DETAIL_RESPONSE_DATA.name),
    ).toBeInTheDocument();
    expect(
      await screen.findByText(MOCK_GOAL_DETAIL_RESPONSE_DATA.description),
    ).toBeInTheDocument();
    expect(
      await screen.findByText(MOCK_GOAL_DETAIL_RESPONSE_DATA.tasks[0].name),
    ).toBeInTheDocument();
  });
});
