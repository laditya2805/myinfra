import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
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
      "no-undef": "off", // disable this rule because Node defines things like `require`, `exports`
    },
  }
);
