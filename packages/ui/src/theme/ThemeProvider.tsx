"use client"

import type { ThemeProviderProps as BetterThemesProps } from "better-themes/rsc"
import type { PropsWithChildren } from "react"
import { useMemo } from "react"
import { ThemeProvider as BetterThemesProvider } from "better-themes/rsc"

import type { DocConfig } from "../types"
import { toCssVars } from "./tokens"

export interface ThemeProviderProps extends PropsWithChildren {
  config: DocConfig
  theme?: BetterThemesProps
}

export function ThemeProvider({ config, theme, children }: ThemeProviderProps) {
  const style = useMemo(() => toCssVars(config.theme), [config.theme])

  const content = <div style={style}>{children}</div>

  return theme ? <BetterThemesProvider {...theme}>{content}</BetterThemesProvider> : content
}
