const js = require("@eslint/js");
const ts = require("@typescript-eslint/eslint-plugin");
const parser = require("@typescript-eslint/parser");

module.exports = [
  js.configs.recommended,
  {
    files: ["**/*.ts"],
    ignores: ["dist/**", "node_modules/**"], // ✅ ignores compiled JS
    languageOptions: {
      parser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    plugins: {
      "@typescript-eslint": ts,
    },
    rules: {
      "no-unused-vars": ["warn", { argsIgnorePattern: "^(event|context)$" }],
      "no-console": "off",
    },
  },
];
