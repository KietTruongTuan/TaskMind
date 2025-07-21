import { render, screen } from "@testing-library/react";

import Home from "./page";

describe("Home page", () => {
  it("render UI", () => {
    render(<Home></Home>);
    expect(screen.getByText("Read our docs")).toBeInTheDocument();
  });
});
