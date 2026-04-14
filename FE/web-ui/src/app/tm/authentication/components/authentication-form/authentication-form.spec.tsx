import { ThemeProvider } from "@/app/contexts/theme-context/theme-context";
import { render, screen } from "@testing-library/react";
import { AuthenticationForm } from "./authentication-form";
import userEvent from "@testing-library/user-event";
import { ToastProvider } from "@/app/contexts/toast-context/toast-context";
import { RouteLoadingProvider } from "@/app/contexts/route-loading-context/route-loading-context";

describe("Authentication Form", () => {
  it("should render the login form as default", async () => {
    render(
      <RouteLoadingProvider>
        <ToastProvider>
          <ThemeProvider>
            <AuthenticationForm />
          </ThemeProvider>
        </ToastProvider>
      </RouteLoadingProvider>
    );

    expect(await screen.findByTestId("email-input-field")).toBeInTheDocument();
    expect(
      await screen.findByTestId("password-input-field")
    ).toBeInTheDocument();
    expect(await screen.findByTestId("login-form")).toBeInTheDocument();
  });

  it("should render the register form when click Sign up", async () => {
    render(
      <RouteLoadingProvider>
        <ToastProvider>
          <ThemeProvider>
            <AuthenticationForm />
          </ThemeProvider>
        </ToastProvider>
      </RouteLoadingProvider>
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
      <RouteLoadingProvider>
        <ToastProvider>
          <ThemeProvider>
            <AuthenticationForm />
          </ThemeProvider>
        </ToastProvider>
      </RouteLoadingProvider>
    );

    await userEvent.click(screen.getByTestId("goto-button"));
    expect(await screen.findByTestId("registration-form")).toBeInTheDocument();
    await userEvent.click(screen.getByTestId("goto-button"));
    expect(await screen.findByTestId("login-form")).toBeInTheDocument();
  });

  it("should show password not match message", async () => {
    render(
      <RouteLoadingProvider>
        <ToastProvider>
          <ThemeProvider>
            <AuthenticationForm />
          </ThemeProvider>
        </ToastProvider>
      </RouteLoadingProvider>
    );

    await userEvent.click(screen.getByTestId("goto-button"));
    await userEvent.type(
      await screen.findByTestId("username-field"),
      "Test name"
    );

    await userEvent.type(
      await screen.findByTestId("email-field"),
      "testemail@gmail.com"
    );

    await userEvent.type(
      await screen.findByTestId("password-field"),
      "Testpassword123"
    );

    await userEvent.type(
      await screen.findByTestId("confirmPassword-field"),
      "Testpassword1"
    );
    const submitButton = await screen.findByTestId("register-submit-button");
    await userEvent.click(submitButton);
    expect(
      await screen.findByText("Passwords do not match")
    ).toBeInTheDocument();
  });
});
