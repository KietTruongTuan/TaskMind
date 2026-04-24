import { PieChartCard, PieChartData } from "./pie-chart-card";
import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "@/app/contexts/theme-context/theme-context";
import { RouteLoadingProvider } from "@/app/contexts/route-loading-context/route-loading-context";
import { ToastProvider } from "@/app/contexts/toast-context/toast-context";
import { TokenRefresherProvider } from "@/app/contexts/token-refresher-context/token-refresher-context";

describe("PieChartCard", () => {
  it("should render chart with no data", async () => {
    const mockData: PieChartData[] = [
      { id: 1, value: 0, label: "Task 1", color: "#ff0000" },
      { id: 2, value: 0, label: "Task 2", color: "#00ff00" },
    ];
    render(
      <ThemeProvider>
        <RouteLoadingProvider>
          <ToastProvider>
            <TokenRefresherProvider>
              <PieChartCard
                header="Pie Chart Card"
                subHeader="Pie Chart Card"
                data={mockData}
              />
            </TokenRefresherProvider>
          </ToastProvider>
        </RouteLoadingProvider>
      </ThemeProvider>,
    );
    expect(
      screen.getByText("No task available"),
    ).toBeInTheDocument();
  });
});
