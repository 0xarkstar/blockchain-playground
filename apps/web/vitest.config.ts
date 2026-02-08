import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["**/*.test.{ts,tsx}"],
    globals: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov", "html"],
      include: ["lib/**/*.ts"],
      exclude: ["**/*.test.ts", "**/*.test.tsx", "e2e/**"],
      thresholds: { statements: 80, branches: 75, functions: 80, lines: 80 },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@components": path.resolve(__dirname, "./components"),
      "@lib": path.resolve(__dirname, "./lib"),
    },
  },
});
