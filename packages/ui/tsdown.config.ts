import { defineConfig } from "tsdown"

export default defineConfig({
  entry: {
    index: "src/index.tsx",
    framework: "src/framework/client.tsx",
    mdx: "src/mdx/index.tsx",
    "layouts/classic": "src/layouts/classic/index.tsx",
    "layouts/minimal": "src/layouts/minimal/index.tsx",
    theme: "src/theme/client.ts",
  },
  minify: false,
  dts: true,
  tsconfig: "./tsconfig.json",
  deps: {
    skipNodeModulesBundle: true,
  },
})
