import { render, screen } from "@testing-library/react";
import { NavigationBar } from "./navigation-bar";
import userEvent from "@testing-library/user-event";
import { MOCK_ROUTER_PUSH } from "../../../../../../jest.setup";
import { ThemeProvider } from "@/app/contexts/theme-context/theme-context";

describe("Navigation bar", () => {
  it("should render the navigation bar", async () => {
    render(
      <ThemeProvider>
        <NavigationBar userAvatar="https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?&w=256&h=256&q=70&crop=focalpoint&fp-x=0.5&fp-y=0.3&fp-z=1&fit=crop" />
      </ThemeProvider>
    );

    expect(await screen.findByTestId("navbar-items")).toBeInTheDocument();
    expect(await screen.findByText("AI Goal Manager")).toBeInTheDocument();
  });

  it("should go to add goal page when click the tab button", async () => {
    render(
      <ThemeProvider>
        <NavigationBar userAvatar="https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?&w=256&h=256&q=70&crop=focalpoint&fp-x=0.5&fp-y=0.3&fp-z=1&fit=crop" />
      </ThemeProvider>
    );
    await userEvent.click(await screen.findByTestId("add-goal-tab"));

    expect(MOCK_ROUTER_PUSH).toHaveBeenCalledWith("/tm/workspace/goal/add");
  });
});
