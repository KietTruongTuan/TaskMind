import { PieChartCard, PieChartData } from "./pie-chart-card";
import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "@/app/contexts/theme-context/theme-context";
import { RouteLoadingProvider } from "@/app/contexts/route-loading-context/route-loading-context";
import { ToastProvider } from "@/app/contexts/toast-context/toast-context";
import { TokenRefresherProvider } from "@/app/contexts/token-refresher-context/token-refresher-context";
import { Status } from "@/app/enum/status.enum";

jest.mock("@mui/x-charts", () => ({
  PieChart: (props: any) => {
    const formatter = props.series?.[0]?.valueFormatter;
    const formattedValue = formatter ? formatter({ value: 42 }) : "";
    return <div data-testid="mock-pie-chart">{formattedValue}</div>;
  },
}));

describe("PieChartCard", () => {
  it("should render chart with no data", async () => {
    const mockData: PieChartData[] = [
      { id: Status.ToDo, value: 0, label: "Task 1", color: "#ff0000" },
      { id: Status.InProgress, value: 0, label: "Task 2", color: "#00ff00" },
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

  it("should render chart and execute valueFormatter when data is available", async () => {
    const mockData: PieChartData[] = [
      { id: Status.ToDo, value: 10, label: "Task 1", color: "#ff0000" },
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
    
    expect(screen.getByTestId("mock-pie-chart")).toHaveTextContent("42");
  });
});
