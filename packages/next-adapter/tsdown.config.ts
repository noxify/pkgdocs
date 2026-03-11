import { defineConfig } from "tsdown"

export default defineConfig({
  entry: {
    index: "src/index.ts",
    framework: "src/framework.ts",
  },
  minify: true,
  dts: true,
  tsconfig: "./tsconfig.json",
  deps: {
    skipNodeModulesBundle: true,
  },
})
