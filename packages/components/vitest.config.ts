import react from "@vitejs/plugin-react"
import tsconfigPaths from "vite-tsconfig-paths"
import { defineConfig, Plugin } from "vitest/config"

export default defineConfig({
  plugins: [react() as unknown as Plugin, tsconfigPaths() as unknown as Plugin],
  test: {
    environment: "jsdom",
    env: {
      NODE_ENV: "test",
    },
  },
})
