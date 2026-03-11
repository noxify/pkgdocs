"use client"

import type { ThemeProviderProps } from "@pkgdocs/ui/theme"
import { ThemeProvider } from "@pkgdocs/ui/theme"

export function ThemeProviderWrapper(props: ThemeProviderProps) {
  return <ThemeProvider {...props} />
}
