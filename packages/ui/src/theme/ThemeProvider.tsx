"use client"

import type { PropsWithChildren } from "react"
import { useMemo } from "react"
import { ThemeProvider as BetterThemesProvider } from "better-themes/rsc"

import type { DocConfig } from "@pkgdocs/config"

import { useFrameworkAdapter } from "../framework"
import { resolveLayout } from "../registry/layouts"

export interface ThemeProviderProps extends PropsWithChildren {
  config: DocConfig
}

export function ThemeProvider({ config, children }: ThemeProviderProps) {
  const framework = useFrameworkAdapter()
  const Layout = useMemo(
    () => resolveLayout(config.pkgdocs?.layout ?? "pkgdocs"),
    [config.pkgdocs?.layout],
  )
  const resolvedConfig = useMemo<DocConfig>(
    () => ({
      ...config,
      pkgdocs: config.pkgdocs ?? { layout: "pkgdocs" },
      framework: {
        ...framework.capabilities,
        ...config.framework,
      },
    }),
    [config, framework.capabilities],
  )

  const content = (
    <div>
      <Layout config={resolvedConfig}>{children}</Layout>
    </div>
  )

  return resolvedConfig.betterThemes !== false ? (
    <BetterThemesProvider {...(resolvedConfig.betterThemes ?? {})}>{content}</BetterThemesProvider>
  ) : (
    content
  )
}
