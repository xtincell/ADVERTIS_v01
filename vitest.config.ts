import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "happy-dom",
    include: ["src/**/*.test.{ts,tsx}"],
    exclude: ["node_modules", ".next", "generated"],
    globals: true,
  },
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "./src"),
    },
  },
});
