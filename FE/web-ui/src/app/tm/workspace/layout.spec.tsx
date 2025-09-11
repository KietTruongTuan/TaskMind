import { render, screen } from "@testing-library/react";
import Layout from "./layout";
import { ThemeProvider } from "@/app/contexts/theme-context/theme-context";

describe("Workspace Layout", () => {
  it("should render the layout with navigation bar and theme toggle", async () => {
    render(
      <ThemeProvider>
        <Layout>
          <div data-testid="child">Mock Component</div>
        </Layout>
      </ThemeProvider>
    );

    expect(screen.getByTestId("theme-toggle")).toBeInTheDocument();
    expect(screen.getByTestId("navbar")).toBeInTheDocument();
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });
});
