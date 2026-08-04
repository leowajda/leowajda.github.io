import js from "@eslint/js"
import globals from "globals"

const sharedRules = {
  "curly": ["error", "multi-line"],
  "eqeqeq": ["error", "always"],
  "no-var": "error",
  "prefer-const": "error",
  "prefer-template": "warn",
  "object-shorthand": "error",
  "no-shadow": "error",
  "no-console": ["error", { "allow": ["warn", "error", "debug", "log"] }],
  "no-unused-vars": ["error", {
    "argsIgnorePattern": "^_",
    "caughtErrorsIgnorePattern": "^_"
  }]
}

export default [
  {
    ignores: [
      "_site/**",
      "node_modules/**",
      "sources/**",
      "tmp/**",
      "vendor/**"
    ]
  },
  js.configs.recommended,
  {
    files: ["site-src/assets/js/**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: globals.browser
    },
    rules: sharedRules
  },
  {
    files: ["script/**/*.mjs", "eslint.config.mjs", "playwright.config.mjs"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: globals.node
    },
    rules: sharedRules
  },
  {
    files: ["tests/functional/**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: globals.node
    },
    rules: sharedRules
  }
]
