import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "@/app/contexts/theme-context/theme-context";
import { RecentGoalList } from "./recent-goal-list";

describe("Recent goal list", () => {
  it("should render recent goal list", async () => {
    render(
      <ThemeProvider>
        <RecentGoalList
          header="Recent Goals"
          subHeader="List of recent goals"
          nullMessage="No recent goals found"
          cardTypeComponent={() => <div></div>}
          data={[]}
        />
      </ThemeProvider>,
    )
    expect(
      screen.getByText("No recent goals found"),
    ).toBeInTheDocument();
  });
});
