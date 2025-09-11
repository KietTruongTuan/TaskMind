import { ThemeProvider } from "@/app/contexts/theme-context/theme-context";
import { render, screen } from "@testing-library/react";
import { ThemeToggle } from "./theme-toggle";
import userEvent from "@testing-library/user-event";
import { act } from "react";

describe("Theme toggle button", () => {
  it("should render the toggle button", async () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );

    expect(await screen.findByTestId("theme-toggle")).toBeInTheDocument();
    expect(await screen.findByTestId("dark-icon")).toBeInTheDocument();
  });

  it("should change the theme when click the button", async () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );
    await act(async () => {
      userEvent.click(await screen.findByTestId("theme-toggle"));
    });

    expect(await screen.findByTestId("light-icon")).toBeInTheDocument();
  });
});
