import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"
import { resolve } from "path"

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/tests/setup.ts"],
    globals: true,
    testTimeout: 30000,
    include: ["src/**/*.test.{ts,tsx}"],
    exclude: ["e2e/**"],
  },
  resolve: {
    alias: {
      "~/": resolve(__dirname, "src") + "/",
    },
  },
})
