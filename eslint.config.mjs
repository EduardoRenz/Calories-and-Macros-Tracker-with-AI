import { realpathSync } from "node:fs";
import { createRequire } from "node:module";

const nextConfigRequire = createRequire(realpathSync("./node_modules/eslint-config-next/index.js"));

const nextPlugin = nextConfigRequire("@next/eslint-plugin-next");
const typescriptPlugin = nextConfigRequire("@typescript-eslint/eslint-plugin");
const typescriptParser = nextConfigRequire("@typescript-eslint/parser");
const reactPlugin = nextConfigRequire("eslint-plugin-react");
const reactHooksPlugin = nextConfigRequire("eslint-plugin-react-hooks");
const importPlugin = nextConfigRequire("eslint-plugin-import");
const jsxA11yPlugin = nextConfigRequire("eslint-plugin-jsx-a11y");

const nextRecommendedRules = nextPlugin.configs.recommended.rules;
const nextCoreWebVitalsRules = nextPlugin.configs["core-web-vitals"].rules;
const reactRecommendedRules = reactPlugin.configs.flat.recommended.rules;
const reactHooksRecommendedRules = reactHooksPlugin.configs.recommended.rules;
const typescriptRecommendedRules = typescriptPlugin.configs["flat/recommended"].flatMap(
  (config) => config.rules ? [config.rules] : [],
);

const browserGlobals = Object.fromEntries([
  "AbortController",
  "Blob",
  "CustomEvent",
  "Event",
  "File",
  "FormData",
  "Headers",
  "Request",
  "Response",
  "URL",
  "URLSearchParams",
  "Window",
  "clearInterval",
  "clearTimeout",
  "console",
  "document",
  "fetch",
  "localStorage",
  "navigator",
  "setInterval",
  "setTimeout",
  "window",
].map((name) => [name, "readonly"]));

const nodeGlobals = Object.fromEntries([
  "Buffer",
  "NodeJS",
  "process",
].map((name) => [name, "readonly"]));

export default [
  {
    ignores: [
      ".next/**",
      "dist/**",
      "node_modules/**",
      "supabase/functions/**",
      "tsconfig.tsbuildinfo",
    ],
  },
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: {
      "@next/next": nextPlugin,
      "@typescript-eslint": typescriptPlugin,
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
      import: importPlugin,
      "jsx-a11y": jsxA11yPlugin,
    },
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...browserGlobals,
        ...nodeGlobals,
      },
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      ...nextRecommendedRules,
      ...nextCoreWebVitalsRules,
      ...reactRecommendedRules,
      ...reactHooksRecommendedRules,
      "import/no-anonymous-default-export": "warn",
      "react/no-unknown-property": "off",
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "jsx-a11y/alt-text": [
        "warn",
        {
          elements: ["img"],
          img: ["Image"],
        },
      ],
      "jsx-a11y/aria-props": "warn",
      "jsx-a11y/aria-proptypes": "warn",
      "jsx-a11y/aria-unsupported-elements": "warn",
      "jsx-a11y/role-has-required-aria-props": "warn",
      "jsx-a11y/role-supports-aria-props": "warn",
      "react/jsx-no-target-blank": "off",
    },
  },
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        sourceType: "module",
      },
    },
    rules: Object.assign({}, ...typescriptRecommendedRules),
  },
];
