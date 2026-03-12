const tsParser = require("@typescript-eslint/parser");

/** @type {import("eslint").Linter.Config[]} */
module.exports = [
  {
    ignores: ["**/node_modules/**", "**/dist/**", "**/.expo/**", "**/build/**"],
  },
  {
    files: ["apps/**/*.{js,ts,tsx}", "packages/**/*.{js,ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
    },
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "**/packages/**",
                "../packages/**",
                "../../packages/**",
                "packages/**",
              ],
              message:
                "Do not import workspace packages via relative paths. Use the public package namespace (@bitcraft/*).",
            },
          ],
        },
      ],
    },
  },
];
