import { defineConfig } from "@pkgdocs/config"

/** @type {import("@pkgdocs/config").DocConfigFile} */
export default defineConfig({
  layout: "classic",
  renoun: {},
  betterThemes: {},
  framework: {
    prefetch: false,
    useOptimizedImage: false,
  },
  ui: {},
})
