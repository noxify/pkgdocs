import { defineConfig } from "@pkgdocs/config"

/** @type {import("@pkgdocs/config").DocConfig} */
export default defineConfig({
  renoun: {},
  betterThemes: {},
  framework: {
    prefetch: false,
    useOptimizedImage: false,
  },
  pkgdocs: {
    layout: "minimal",
  },
})
