import { defineConfig } from "@pkgdocs/config"

/** @type {import("@pkgdocs/config").DocConfigFile} */
export default defineConfig({
  layout: "minimal",
  renoun: {},
  betterThemes: {},
  framework: {
    next: {
      prefetch: true,
      useOptimizedImage: true,
    },
  },
  ui: {},
})
