import mdx from "@mdx-js/rollup"
import { defineConfig } from "vitest/config"

export default defineConfig({
  plugins: [mdx()],
  test: {
    alias: {
      "~/": new URL("./src/", import.meta.url).pathname,
    },
  },
})
