import { renderHook } from "@testing-library/react";
import { useTokenRefresherContext } from "./token-refresher-context";

describe("useTokenRefresherContext", () => {
  it("should throw an error when used outside of TokenRefresherProvider", () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    expect(() => {
      renderHook(() => useTokenRefresherContext());
    }).toThrow("useTokenRefresherContext must be used inside TokenRefresherProvider");

    consoleSpy.mockRestore();
  });
});