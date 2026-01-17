import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SideBarDialog } from "./side-bar-dialog";
import { ThemeProvider } from "@/app/contexts/theme-context/theme-context";
import { MOCK_ROUTER_PUSH } from "../../../../../../jest.setup";

describe("Side bar dialog", () => {
  it("should go to New goal page when click item", async () => {
    render(
      <ThemeProvider>
        <SideBarDialog />
      </ThemeProvider>
    );
    await userEvent.click(await screen.findByTestId("sidebar-button"));
    await userEvent.click(await screen.findByText("New Goal"));
    expect(MOCK_ROUTER_PUSH).toHaveBeenCalledWith("/tm/workspace/goal/add");
  });

  it("executes onEscapeKeyDown and prevents closing", async () => {
    render(
      <ThemeProvider>
        <SideBarDialog />
      </ThemeProvider>
    );
    await userEvent.click(await screen.findByTestId("sidebar-button"));
    await userEvent.keyboard("{Escape}");

    expect(screen.getByText("AI Goal Manager")).toBeInTheDocument();
  });
});
