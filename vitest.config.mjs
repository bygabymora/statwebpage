import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    // Email templates import their HTML through webpack's raw-loader
    // (`!!raw-loader!./file.html`); Vite's `?raw` does the same in tests.
    alias: [{ find: /^!!raw-loader!(.*)$/, replacement: "$1?raw" }],
  },
  test: {
    environment: "node",
    include: ["**/*.test.js"],
    exclude: ["**/node_modules/**", "**/.next/**"],
  },
});
