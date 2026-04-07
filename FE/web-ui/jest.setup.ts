import "@testing-library/jest-dom";

class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

global.ResizeObserver = ResizeObserver;

if (typeof global.structuredClone === 'undefined') {
  global.structuredClone = (val) => JSON.parse(JSON.stringify(val));
}

export const MOCK_ROUTER_PUSH = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: MOCK_ROUTER_PUSH,
    refresh: jest.fn(),
  }),
  usePathname: jest.fn(),
  useSearchParams: jest.fn(),
}));

const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  console.error = (...args) => {
    // Hide the Radix UI "DialogTitle" error
    if (typeof args[0] === 'string' && args[0].includes('requires a `DialogTitle`')) {
      return;
    }
    originalError.call(console, ...args);
  };

  console.warn = (...args) => {
    // Hide the Radix UI "Description" warning
    if (typeof args[0] === 'string' && args[0].includes('Missing `Description`')) {
      return;
    }
    originalWarn.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});
