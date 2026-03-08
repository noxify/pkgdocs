import { defineConfig } from "tsdown"

export default defineConfig({
  entry: {
    "hooks/*": ["./src/hooks/*.tsx", "./src/hooks/*.ts"],
  },
  minify: true,
  dts: true,
  tsconfig: "./tsconfig.json",
  deps: {
    skipNodeModulesBundle: true,
  },
})
