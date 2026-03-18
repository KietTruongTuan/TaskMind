import { render, screen } from "@testing-library/react";
import DashboardPage from "./page";
import { TokenRefresherProvider } from "@/app/contexts/token-refresher-context/token-refresher-context";
import { ToastProvider } from "@/app/contexts/toast-context/toast-context";
import { RouteLoadingProvider } from "@/app/contexts/route-loading-context/route-loading-context";
import { ThemeProvider } from "@/app/contexts/theme-context/theme-context";

describe("DashboardPage", () => {
  it("should render page", () => {
    render(
      <ThemeProvider>
        <RouteLoadingProvider>
          <ToastProvider>
            <TokenRefresherProvider>
              <DashboardPage />
            </TokenRefresherProvider>
          </ToastProvider>
        </RouteLoadingProvider>
      </ThemeProvider>,
    );
    expect(screen.getAllByTestId("recent-list")[0]).toBeInTheDocument();
    expect(screen.getByTestId("status-card-list")).toBeInTheDocument();
    expect(
      screen.getByText("Today is a wonderful day to achieve your goals."),
    ).toBeInTheDocument();
  });
});
