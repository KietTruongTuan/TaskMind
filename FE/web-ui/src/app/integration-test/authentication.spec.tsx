import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider } from "@/app/contexts/theme-context/theme-context";
import { ToastProvider } from "@/app/contexts/toast-context/toast-context";
import { RouteLoadingProvider } from "@/app/contexts/route-loading-context/route-loading-context";
import { authenticationService } from "@/app/constants";
import AuthenticationPage from "@/app/tm/authentication/page";


jest.mock("@/app/constants", () => ({
  ...jest.requireActual("@/app/constants"),
  authenticationService: {
    login: jest.fn(),
    register: jest.fn(),
  },
}));

describe("Authentication Integration Test", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render login form by default and successfully login", async () => {
    const user = userEvent.setup();
    (authenticationService.login as jest.Mock).mockResolvedValue({
      message: "Login successfully",
      access: "mocked_jwt_token",
    });

    render(
      <ThemeProvider>
        <ToastProvider>
          <RouteLoadingProvider>
            <AuthenticationPage />
          </RouteLoadingProvider>
        </ToastProvider>
      </ThemeProvider>,
    );

    const emailInput = await screen.findByTestId("email-field");
    const passwordInput = await screen.findByTestId("password-field");

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "Password123");

    const submitBtn = await screen.findByTestId("register-submit-button");
    await user.click(submitBtn);

    await waitFor(() => {
      expect(authenticationService.login).toHaveBeenCalledWith(
        expect.objectContaining({
          email: "test@example.com",
          password: "Password123",
        }),
      );
    });
  }, 10000);

  it("should switch to registration form, successfully register, and switch back to login", async () => {
    const user = userEvent.setup();
    (authenticationService.register as jest.Mock).mockResolvedValue({
      message: "Register successfully",
    });

    render(
      <ThemeProvider>
        <ToastProvider>
          <RouteLoadingProvider>
            <AuthenticationPage />
          </RouteLoadingProvider>
        </ToastProvider>
      </ThemeProvider>,
    );

    const gotoButton = await screen.findByTestId("goto-button");
    await user.click(gotoButton);

    expect(await screen.findByTestId("registration-form")).toBeInTheDocument();

    const usernameInput = await screen.findByTestId("username-field");
    const emailInput = await screen.findByTestId("email-field");
    const passwordInput = await screen.findByTestId("password-field");
    const confirmPasswordInput = await screen.findByTestId(
      "confirm Password-field",
    );

    await user.type(usernameInput, "testuser");
    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "Password123");
    await user.type(confirmPasswordInput, "Password123");

    const submitBtn = await screen.findByTestId("register-submit-button");
    await user.click(submitBtn);

    await waitFor(() => {
      expect(authenticationService.register).toHaveBeenCalledWith(
        expect.objectContaining({
          username: "testuser",
          email: "test@example.com",
          password: "Password123",
          "confirm Password": "Password123",
        }),
      );
    });

    expect(await screen.findByTestId("login-form")).toBeInTheDocument();
  }, 10000);

  it("should show error toast when login fails", async () => {
    const user = userEvent.setup();
    (authenticationService.login as jest.Mock).mockRejectedValue({
      message: "Invalid credentials",
    });

    render(
      <ThemeProvider>
        <ToastProvider>
          <RouteLoadingProvider>
            <AuthenticationPage />
          </RouteLoadingProvider>
        </ToastProvider>
      </ThemeProvider>,
    );

    const emailInput = await screen.findByTestId("email-field");
    const passwordInput = await screen.findByTestId("password-field");

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "Password123");

    const submitBtn = await screen.findByTestId("register-submit-button");
    await user.click(submitBtn);

    expect(await screen.findByText("Invalid credentials")).toBeInTheDocument();
  }, 10000);
});
