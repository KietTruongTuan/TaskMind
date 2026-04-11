import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MOCK_ROUTER_PUSH } from "../../../../jest.setup";
import { ThemeProvider } from "@/app/contexts/theme-context/theme-context";
import { WebUrl } from "@/app/enum/web-url.enum";
import { RouteLoadingProvider } from "@/app/contexts/route-loading-context/route-loading-context";
import { SideBar } from "./side-bar";


describe("Side bar", () => {
  it("should open the Side bar", async () => {
    render(
      <ThemeProvider>
        <RouteLoadingProvider>
          <SideBar />
        </RouteLoadingProvider>
      </ThemeProvider>,
    );

    await userEvent.click(await screen.findByTestId("side-bar-open-button"));
    expect(await screen.findByText("Dashboard")).toBeInTheDocument();
    expect(await screen.findByText("New Goal")).toBeInTheDocument();
    expect(await screen.findByText("My Goals")).toBeInTheDocument();
    expect(await screen.findByText("All Tasks")).toBeInTheDocument();
  });

  it("should go to add goal page when click the tab button", async () => {
    render(
      <RouteLoadingProvider>
        <ThemeProvider>
          <SideBar />
        </ThemeProvider>
      </RouteLoadingProvider>,
    );
    await userEvent.click(await screen.findByTestId("add-goal-tab"));

    expect(MOCK_ROUTER_PUSH).toHaveBeenCalledWith(WebUrl.GoalAdd);
  });
});
