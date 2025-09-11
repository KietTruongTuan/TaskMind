import "@testing-library/jest-dom";

class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

global.ResizeObserver = ResizeObserver;

export const MOCK_ROUTER_PUSH = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: MOCK_ROUTER_PUSH,
  }),
  usePathname: jest.fn(),
}));
