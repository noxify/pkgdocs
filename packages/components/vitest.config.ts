import react from "@vitejs/plugin-react"
import { defineConfig } from "vitest/config"

export default defineConfig({
  plugins: [react()],

  test: {
    passWithNoTests: true,
    alias: {
      "~/": new URL("./src/", import.meta.url).pathname,
    },
    environment: "jsdom",
    env: {
      NODE_ENV: "test",
    },
  },
})
