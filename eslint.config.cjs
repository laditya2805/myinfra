const js = require("@eslint/js");
const tseslint = require("typescript-eslint");

module.exports = tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...tseslint.configs.recommended.languageOptions.globals,
        node: true,
      },
      ecmaVersion: "latest",
      sourceType: "module",
    },
    ignores: ["dist/**"],
    rules: {
      "no-undef": "off",
    },
  }
);
