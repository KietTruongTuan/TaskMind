import { render, screen } from "@testing-library/react";
import DashboardPage from "./page";

describe("DashboardPage", () => {
  it("should render page", () => {
    render(<DashboardPage />);
    expect(screen.getByText("Hi, Kent!")).toBeInTheDocument();
    expect(screen.getAllByTestId("recent-list")[0]).toBeInTheDocument();
    expect(screen.getByTestId("status-card-list")).toBeInTheDocument();
    expect(
      screen.getByText("Today is a wonderful day to achieve your goals.")
    ).toBeInTheDocument();
  });

});
