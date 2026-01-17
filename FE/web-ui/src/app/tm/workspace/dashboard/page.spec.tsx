import { render, screen } from "@testing-library/react";
import DashboardPage from "./page";
import { TokenRefresherProvider } from "@/app/contexts/token-refresher-context/token-refresher-context";

describe("DashboardPage", () => {
  it("should render page", () => {
    render(
      <TokenRefresherProvider>
        <DashboardPage />
      </TokenRefresherProvider>
    );
    expect(screen.getAllByTestId("recent-list")[0]).toBeInTheDocument();
    expect(screen.getByTestId("status-card-list")).toBeInTheDocument();
    expect(
      screen.getByText("Today is a wonderful day to achieve your goals.")
    ).toBeInTheDocument();
  });
});
