import type { Config } from "jest";
import nextJest from "next/jest.js";

// 1. Update this to your new relative path. 
// If your Next.js files are now in the root, use "./"
const createJestConfig = nextJest({
  dir: "./", 
});

const config: Config = {
  coverageProvider: "v8",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  collectCoverage: true,
  // 2. Update these globs to reflect your new folder structure
  collectCoverageFrom: ["src/app/**/*.{ts,tsx,js,jsx}"], 
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
    // 3. Update the specific path threshold
    "src/app/**/*.ts?(x)": {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  coverageDirectory: "coverage",
  coverageReporters: ["json", "text", "lcov"],
  clearMocks: true,
  moduleNameMapper: {
    // This ensures your @/ aliases still work from the new root
    "^@/(.*)$": "<rootDir>/src/$1", 
  },
  testMatch: ["**/*.spec.ts", "**/*.spec.tsx"],
};

export default createJestConfig(config);