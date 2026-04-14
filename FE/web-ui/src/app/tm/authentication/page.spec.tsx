import { Box } from "@radix-ui/themes";
import { render, screen } from "@testing-library/react";
import AuthenticationPage from "./page";
import { ThemeProvider } from "@/app/contexts/theme-context/theme-context";

jest.mock("./components/authentication-form/authentication-form", () => ({
  AuthenticationForm: () => <Box>Mocked Component</Box>,
}));

describe("Authentication Page", () => {
  it("should render the page", () => {
    render(
      <ThemeProvider>
        <AuthenticationPage />
      </ThemeProvider>
    );

    expect(screen.getByText("AI Goal Manager")).toBeInTheDocument();
    expect(
      screen.getByText("Smart goal management system")
    ).toBeInTheDocument();

    expect(screen.getByText("Mocked Component")).toBeInTheDocument();
    expect(screen.getByTestId("theme-toggle")).toBeInTheDocument();
  });
});
