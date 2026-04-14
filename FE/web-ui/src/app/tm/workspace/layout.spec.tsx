import { render, screen } from "@testing-library/react";
import Layout from "./layout";
import { ThemeProvider } from "@/app/contexts/theme-context/theme-context";
import { TokenRefresherProvider } from "@/app/contexts/token-refresher-context/token-refresher-context";
import { RouteLoadingProvider } from "@/app/contexts/route-loading-context/route-loading-context";
import { ToastProvider } from "@/app/contexts/toast-context/toast-context";

describe("Workspace Layout", () => {
  it("should render the layout with navigation bar and theme toggle", async () => {
    render(
      <ToastProvider>
        <RouteLoadingProvider>
          <TokenRefresherProvider>
            <ThemeProvider>
              <Layout>
                <div data-testid="child">Mock Component</div>
              </Layout>
            </ThemeProvider>
          </TokenRefresherProvider>
        </RouteLoadingProvider>
      </ToastProvider>,
    );

    expect(screen.getByTestId("theme-toggle")).toBeInTheDocument();
    expect(screen.getByTestId("navbar")).toBeInTheDocument();
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });
});
