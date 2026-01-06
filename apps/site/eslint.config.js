import baseConfig, { restrictEnvAccess } from "@pkgdocs/eslint-config/base"
import nextjsConfig from "@pkgdocs/eslint-config/nextjs"
import reactConfig from "@pkgdocs/eslint-config/react"

/** @type {import('typescript-eslint').Config} */
export default [
  {
    ignores: [".next/**"],
  },
  ...baseConfig,
  ...reactConfig,
  ...nextjsConfig,
  ...restrictEnvAccess,
]
