"use client"

import type { ThemeProviderProps } from "@pkgdocs/ui"
import { ThemeProvider } from "@pkgdocs/ui"

export function ThemeProviderWrapper(props: ThemeProviderProps) {
  return <ThemeProvider {...props} />
}
