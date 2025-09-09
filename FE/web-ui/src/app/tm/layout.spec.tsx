import { render, screen } from "@testing-library/react";
import RootLayout from "./layout";

describe("RootLayout", () => {
  it("should render the layout", async () => {
    render(
      <RootLayout>
        <div data-testid="child">Mock Component</div>
      </RootLayout>
    );

    expect(screen.getByTestId("child")).toBeInTheDocument();
  });
});
