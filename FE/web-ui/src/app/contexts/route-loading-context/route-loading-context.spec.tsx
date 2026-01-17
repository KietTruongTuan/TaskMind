import { renderHook, act } from "@testing-library/react";
import {
  useRouteLoadingContext,
  RouteLoadingProvider,
} from "./route-loading-context";
import { useRouter } from "next/navigation";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

describe("RouteLoadingContext", () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  });

  it("should throw error when used outside of RouteLoadingProvider", () => {
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    expect(() => {
      renderHook(() => useRouteLoadingContext());
    }).toThrow("useRouteLoadingContext must be inside RouteLoadingProvider");

    consoleSpy.mockRestore();
  });

  it("should call router.push when route function is invoked", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <RouteLoadingProvider>{children}</RouteLoadingProvider>
    );

    const { result } = renderHook(() => useRouteLoadingContext(), { wrapper });

    const testUrl = "/dashboard";

    act(() => {
      result.current.route(testUrl);
    });

    expect(mockPush).toHaveBeenCalledWith(testUrl);
  });
});
