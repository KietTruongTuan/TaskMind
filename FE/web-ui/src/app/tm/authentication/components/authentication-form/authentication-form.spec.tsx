import { ThemeProvider } from "@/app/contexts/theme-context/theme-context";
import { render, screen } from "@testing-library/react";
import { AuthenticationForm } from "./authentication-form";
import userEvent from "@testing-library/user-event";

describe("Authentication Form", () => {
  it("should render the login form as default", async () => {
    render(
      <ThemeProvider>
        <AuthenticationForm />
      </ThemeProvider>
    );

    expect(await screen.findByTestId("email-input-field")).toBeInTheDocument();
    expect(
      await screen.findByTestId("password-input-field")
    ).toBeInTheDocument();
    expect(await screen.findByTestId("login-form")).toBeInTheDocument();
  });

  it("should render the register form when click Sign up", async () => {
    render(
      <ThemeProvider>
        <AuthenticationForm />
      </ThemeProvider>
    );

    await userEvent.click(screen.getByTestId("goto-button"));

    expect(await screen.findByTestId("registration-form")).toBeInTheDocument();
    expect(
      await screen.findByTestId("username-input-field")
    ).toBeInTheDocument();
    expect(await screen.findByTestId("email-input-field")).toBeInTheDocument();
    expect(
      await screen.findByTestId("password-input-field")
    ).toBeInTheDocument();
  });

  it("should go back to sign in", async () => {
    render(
      <ThemeProvider>
        <AuthenticationForm />
      </ThemeProvider>
    );

    await userEvent.click(screen.getByTestId("goto-button"));
    expect(await screen.findByTestId("registration-form")).toBeInTheDocument();
    await userEvent.click(screen.getByTestId("goto-button"));
    expect(await screen.findByTestId("login-form")).toBeInTheDocument();
  });
});
