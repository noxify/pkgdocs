import { defineConfig } from "rolldown"
import { dts } from "rolldown-plugin-dts"
import del from "rollup-plugin-delete"

export default defineConfig({
  checks: {
    pluginTimings: false,
  },
  input: "src/index.ts",
  output: {
    dir: "dist",
    format: "esm",
    entryFileNames: "[name].js",
  },
  plugins: [del({ targets: "dist/*" }), dts()],
  external: [
    "fs",
    "path",
    "@antfu/install-pkg",
    "@clack/prompts",
    "giget",
    "picocolors",
    "read-pkg",
    "terminal-link",
  ],
})
