import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AvatarMenu } from "./avatar-menu";
import { authenticationService, UserPayload } from "@/app/constants";
import { WebUrl } from "@/app/enum/web-url.enum";
import { useTokenRefresherContext } from "@/app/contexts/token-refresher-context/token-refresher-context";
import { useRouteLoadingContext } from "@/app/contexts/route-loading-context/route-loading-context";
import { Theme } from "@radix-ui/themes";
import { ToastProvider } from "@/app/contexts/toast-context/toast-context";

// 1. Mock the Services and Contexts
jest.mock("../../constants", () => ({
  authenticationService: {
    logout: jest.fn(),
  },
}));

jest.mock("../../contexts/token-refresher-context/token-refresher-context");
jest.mock("../../contexts/route-loading-context/route-loading-context");

describe("AvatarMenu onLogOut", () => {
  const mockRoute = jest.fn();
  const mockUser: UserPayload = {
    user_id: "123",
    username: "TestUser",
    email: "testuser@example.com",
  };

  beforeEach(() => {
    jest.clearAllMocks();

    (useRouteLoadingContext as jest.Mock).mockReturnValue({
      route: mockRoute,
      setIsRouteLoading: jest.fn(),
    });

    (useTokenRefresherContext as jest.Mock).mockReturnValue({
      user: mockUser,
      loading: false,
    });
  });

  it("should call logout service and redirect to dashboard when confirmed", async () => {
    const user = userEvent.setup();
    (authenticationService.logout as jest.Mock).mockResolvedValue(undefined);

    render(
      <Theme>
        <ToastProvider>
          <AvatarMenu />
        </ToastProvider>
      </Theme>
    );

    const avatar = await screen.findByText("T");
    await user.click(avatar);

    const logoutMenuItem = await screen.findByTestId("alert-dialog-trigger");
    await user.click(logoutMenuItem);

    const confirmButton = screen.getByTestId("alert-dialog-action");
    await user.click(confirmButton);

    await waitFor(() => {
      expect(authenticationService.logout).toHaveBeenCalledTimes(1);
      expect(mockRoute).toHaveBeenCalledWith(WebUrl.Authentication);
    });
  });
});
