import { render, screen } from "@testing-library/react";
import { GreetingText } from "./greeting-text";
import { useTokenRefresherContext } from "@/app/contexts/token-refresher-context/token-refresher-context";

jest.mock("../../contexts/token-refresher-context/token-refresher-context");

describe("GreetingText", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should display the username when a user is logged in", () => {
    (useTokenRefresherContext as jest.Mock).mockReturnValue({
      user: { username: "TestUser" },
      loading: false,
    });

    render(<GreetingText />);

    expect(screen.getByText("Hi, TestUser!")).toBeInTheDocument();
    expect(
      screen.getByText("Today is a wonderful day to achieve your goals.")
    ).toBeInTheDocument();
  });
});