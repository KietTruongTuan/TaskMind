import { render, screen } from "@testing-library/react";
import AddGoalPage from "./page";
import { MOCK_GOAL_RESPONSE_DATA } from "@/app/constants";
import { RouteLoadingProvider } from "@/app/contexts/route-loading-context/route-loading-context";

describe("AddPage", () => {
  const store: Record<string, string> = {};
  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: jest.fn((key: string) => store[key] || null),
        setItem: jest.fn((key: string, value: string) => {
          store[key] = value.toString();
        }),
      },
      writable: true,
    });
  });

  it("should render page", async () => {
    const AddPage = await AddGoalPage();
    render(<RouteLoadingProvider>{AddPage}</RouteLoadingProvider>);
    expect(await screen.findByTestId("goal-add-header")).toBeInTheDocument();
    expect(await screen.findByTestId("goal-add-form")).toBeInTheDocument();
    expect(await screen.findByTestId("goal-add-button")).toBeInTheDocument();
  });

  it("should render page with draft goal", async () => {
    localStorage.setItem("draftGoal", JSON.stringify(MOCK_GOAL_RESPONSE_DATA));
    const AddPage = await AddGoalPage();
    render(<RouteLoadingProvider>{AddPage}</RouteLoadingProvider>);
    expect(await screen.findByTestId("goal-add-header")).toBeInTheDocument();
    expect(await screen.findByTestId("goal-add-form")).toBeInTheDocument();
    expect(await screen.findByTestId("goal-add-button")).toBeInTheDocument();
  });
});
