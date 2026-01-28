import { defineConfig } from "rolldown"
import { dts } from "rolldown-plugin-dts"
import del from "rollup-plugin-delete"

export default defineConfig({
  checks: {
    pluginTimings: false,
  },
  input: {
    index: "src/index.ts",
    "layouts/classic/index": "src/layouts/classic/index.tsx",
    "layouts/minimal/index": "src/layouts/minimal/index.tsx",
    "mdx/index": "src/mdx/index.tsx",
  },
  output: {
    dir: "dist",
    format: "esm",
    entryFileNames: "[name].js",
    sourcemap: false,
  },
  external: ["react", "react-dom", "react/jsx-dev-runtime", "react/jsx-runtime"],
  plugins: [del({ targets: "dist/*" }), dts()],
})
