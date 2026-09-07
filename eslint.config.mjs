import globals from "globals";
import js from "@eslint/js";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

// eslint-config-next 16 already exports flat config; routing it through
// FlatCompat's legacy validator throws on the plugin object's circular refs.
export default [
  {
    ignores: [".next/**", "out/**", "build/**"],
  },
  js.configs.recommended,
  ...nextCoreWebVitals,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.serviceworker,
        importScripts: "readonly",
        workbox: "readonly",
      },
    },

    rules: {
      "no-console": [
        "warn",
        {
          allow: ["warn", "error"],
        },
      ],

      "react-hooks/exhaustive-deps": "off",
    },
  },
  {
    files: ["**/*.test.js", "**/__tests__/**"],
    languageOptions: {
      globals: globals.jest,
    },
  },
];
