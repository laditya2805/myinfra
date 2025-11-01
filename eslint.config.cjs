const js = require("@eslint/js");

module.exports = [
  js.configs.recommended,
  {
    files: ["**/*.ts"],
    ignores: ["dist/**", "node_modules/**"],
    languageOptions: {
      parser: require("@typescript-eslint/parser"),
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
      globals: {
        process: "readonly",
        console: "readonly",
        exports: "writable",
        require: "readonly",
        module: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": require("@typescript-eslint/eslint-plugin"),
    },
    rules: {
      "no-unused-vars": ["warn", { argsIgnorePattern: "^(event|context)$" }],
      "no-console": "off",
      "no-undef": "off",
    },
  },
];
