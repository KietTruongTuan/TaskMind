import { render, screen } from "@testing-library/react";
import { NavigationBar } from "./navigation-bar";
import userEvent from "@testing-library/user-event";
import { MOCK_ROUTER_PUSH } from "../../../../jest.setup";
import { ThemeProvider } from "@/app/contexts/theme-context/theme-context";
import { WebUrl } from "@/app/enum/web-url.enum";

jest.mock("../avatar-menu/avatar-menu", () => ({
  AvatarMenu: () => <div>Avatar Menu</div>,
}));

describe("Navigation bar", () => {
  it("should render the navigation bar", async () => {
    render(
      <ThemeProvider>
        <NavigationBar />
      </ThemeProvider>,
    );

    expect(await screen.findByTestId("navbar-items")).toBeInTheDocument();
    expect(await screen.findByText("AI Goal Manager")).toBeInTheDocument();
  });

  it("should go to add goal page when click the tab button", async () => {
    render(
      <ThemeProvider>
        <NavigationBar />
      </ThemeProvider>,
    );
    await userEvent.click(await screen.findByTestId("add-goal-tab"));

    expect(MOCK_ROUTER_PUSH).toHaveBeenCalledWith(WebUrl.GoalAdd);
  });
});
