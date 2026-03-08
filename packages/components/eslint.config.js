import baseConfig, { restrictEnvAccess } from "@pkgdocs/eslint-config/base"
import reactConfig from "@pkgdocs/eslint-config/react"

/** @type {import('typescript-eslint').Config} */
export default [
  {
    ignores: ["dist/**"],
  },
  ...baseConfig,
  ...restrictEnvAccess,
  ...reactConfig,
]
