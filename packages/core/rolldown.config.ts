import { defineConfig } from "rolldown"
import del from "rollup-plugin-delete"
import { dts } from 'rolldown-plugin-dts'

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
  plugins: [del({ targets: "dist/*" }), dts()],
})
