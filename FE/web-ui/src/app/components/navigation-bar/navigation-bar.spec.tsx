import { render, screen } from "@testing-library/react";
import { NavigationBar } from "./navigation-bar";
import userEvent from "@testing-library/user-event";
import { MOCK_ROUTER_PUSH } from "../../../../jest.setup";
import { ThemeProvider } from "@/app/contexts/theme-context/theme-context";
import { WebUrl } from "@/app/enum/web-url.enum";
import { RouteLoadingProvider } from "@/app/contexts/route-loading-context/route-loading-context";

jest.mock("../avatar-menu/avatar-menu", () => ({
  AvatarMenu: () => <div>Avatar Menu</div>,
}));

describe("Navigation bar", () => {
  it("should render the navigation bar", async () => {
    render(
      <ThemeProvider>
        <RouteLoadingProvider>
          <NavigationBar />
        </RouteLoadingProvider>
      </ThemeProvider>,
    );

    expect(await screen.findByText("AI Goal Manager")).toBeInTheDocument();
  });

  it("should go to dashboard page when click the logo", async () => {
    render(
      <RouteLoadingProvider>
        <ThemeProvider>
          <NavigationBar />
        </ThemeProvider>
      </RouteLoadingProvider>,
    );
    await userEvent.click(await screen.findByText("AI Goal Manager"));

    expect(MOCK_ROUTER_PUSH).toHaveBeenCalledWith(WebUrl.Dashboard);
  });
});
