import baseConfig, { restrictEnvAccess } from "@pkgdocs/eslint-config/base"

/** @type {import('typescript-eslint').Config} */
export default [{ ignores: ["dist/**"] }, ...baseConfig, ...restrictEnvAccess]
