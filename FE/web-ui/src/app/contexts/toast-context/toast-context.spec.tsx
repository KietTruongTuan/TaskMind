import { renderHook } from "@testing-library/react";
import { useToast } from "./toast-context";

describe("useToastContext", () => {
  it("should throw an error when used outside of ToastProvider", () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    expect(() => {
      renderHook(() => useToast());
    }).toThrow("useToast must be inside ToastProvider");

    consoleSpy.mockRestore();
  });
});