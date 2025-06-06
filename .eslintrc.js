export default {
  parser: "@typescript-eslint/parser",
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  env: {
    browser: true,
    es2021: true,
  },
  rules: {
    semi: ["error", "always"],
    quotes: ["error", "single"],
  },
};
