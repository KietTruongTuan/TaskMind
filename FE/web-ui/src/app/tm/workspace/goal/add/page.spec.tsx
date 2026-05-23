import { render, screen } from "@testing-library/react";
import AddGoalPage from "./page";
import { RouteLoadingProvider } from "@/app/contexts/route-loading-context/route-loading-context";
import { ToastProvider } from "@/app/contexts/toast-context/toast-context";
import { useServerSideService } from "@/app/hooks/useServerSideService/useServerSideService";
import { ThemeProvider } from "@/app/contexts/theme-context/theme-context";

jest.mock("@/app/hooks/useServerSideService/useServerSideService", () => ({
  useServerSideService: jest.fn(),
}));

describe("AddPage", () => {
  const store: Record<string, string> = {};
  beforeEach(() => {
    jest.clearAllMocks();
    (useServerSideService as jest.Mock).mockResolvedValue({
      authenticationService: {
        getProfile: jest.fn().mockResolvedValue({
          id: "123",
          name: "Test User",
          email: "test@example.com",
          enableLocalKb: true,
          enableGlobalKb: true,
        }),
      },
    });
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: jest.fn((key: string) => store[key] || null),
        setItem: jest.fn((key: string, value: string) => {
          store[key] = value.toString();
        }),
      },
      writable: true,
    });
  });

  it("should render page", async () => {
    const AddPage = await AddGoalPage();
    render(
      <ThemeProvider>
        <RouteLoadingProvider>
          <ToastProvider>{AddPage}</ToastProvider>
        </RouteLoadingProvider>
      </ThemeProvider>,
    );
    expect(await screen.findByTestId("goal-add-header")).toBeInTheDocument();
    expect(await screen.findByTestId("goal-add-form")).toBeInTheDocument();
    expect(await screen.findByTestId("goal-add-button")).toBeInTheDocument();
  });

  it("should render page with draft goal", async () => {
    const AddPage = await AddGoalPage();
    render(
      <ThemeProvider>
        <RouteLoadingProvider>
          <ToastProvider>{AddPage}</ToastProvider>
        </RouteLoadingProvider>
      </ThemeProvider>,
    );
    expect(await screen.findByTestId("goal-add-header")).toBeInTheDocument();
    expect(await screen.findByTestId("goal-add-form")).toBeInTheDocument();
    expect(await screen.findByTestId("goal-add-button")).toBeInTheDocument();
  });
});
