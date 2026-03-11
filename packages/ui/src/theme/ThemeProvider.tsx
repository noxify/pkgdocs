"use client"

import type { ThemeProviderProps as BetterThemesProps } from "better-themes/rsc"
import type { PropsWithChildren } from "react"
import { useMemo } from "react"
import { ThemeProvider as BetterThemesProvider } from "better-themes/rsc"

import type { DocConfig } from "../types"
import { useFrameworkAdapter } from "../framework"
import { resolveLayout } from "../registry/layouts"
import { toCssVars } from "./tokens"

export interface ThemeProviderProps extends PropsWithChildren {
  config: DocConfig
  theme?: BetterThemesProps
}

export function ThemeProvider({ config, theme, children }: ThemeProviderProps) {
  const framework = useFrameworkAdapter()
  const style = useMemo(() => toCssVars(config.theme), [config.theme])
  const Layout = useMemo(() => resolveLayout(config.layoutKey), [config.layoutKey])
  const resolvedConfig = useMemo<DocConfig>(
    () => ({
      ...config,
      framework: {
        ...framework.capabilities,
        ...config.framework,
      },
    }),
    [config, framework.capabilities],
  )

  const content = (
    <div style={style}>
      <Layout config={resolvedConfig}>{children}</Layout>
    </div>
  )

  return theme ? <BetterThemesProvider {...theme}>{content}</BetterThemesProvider> : content
}
