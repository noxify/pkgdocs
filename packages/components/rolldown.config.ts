import { defineConfig } from "rolldown"
import { dts } from "rolldown-plugin-dts"
import del from "rollup-plugin-delete"

export default defineConfig({
  checks: {
    pluginTimings: false,
  },
  input: {
    index: "src/index.ts",
  },
  output: {
    dir: "dist",
    format: "esm",
    entryFileNames: "[name].js",
  },
  external: ["renoun", "renoun/file-system", "zod", "react"],
  plugins: [del({ targets: "dist/*" }), dts()],
})
