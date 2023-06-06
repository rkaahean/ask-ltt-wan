module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "eslint:recommended",
  ],
  overrides: [],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: "latest",
    sourceType: "module",
    project: "tsconfig.json",
    tsconfigRootDir: __dirname,
  },
  plugins: ["react", "react-hooks"],
  rules: {},
  settings: {
    react: {
      version: "detect",
    },
  },
};
