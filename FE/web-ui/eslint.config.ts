import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    ignores: ["node_modules", "./FE/web-ui/.next", "dist", "reports"],
  },
  ...compat.config({
    extends: ["next/core-web-vitals", "next/typescript"],
    rules: {
      "no-console": ["warn"],
      "@typescript-eslint/no-explicit-any": "error",
      "react/jsx-no-useless-fragment": "warn",
      "react/no-unstable-nested-components": "error",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "error",
      "react/jsx-key": "error",
      "react/no-unknown-property": "error",
      "@next/next/no-html-link-for-pages": "off",
    },
  }),
];

export default eslintConfig;
