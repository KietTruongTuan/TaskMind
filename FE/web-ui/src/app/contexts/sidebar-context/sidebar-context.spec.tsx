import { renderHook } from "@testing-library/react";
import { useSidebarContext } from "./sidebar-context";

describe("useSidebarContext", () => {
  it("should throw an error when used outside of SidebarProvider", () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    expect(() => {
      renderHook(() => useSidebarContext());
    }).toThrow("useSidebarContext must be used within a SidebarProvider");

    consoleSpy.mockRestore();
  });
});