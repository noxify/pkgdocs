import type { ThemeProviderProps as BetterThemesProps } from "better-themes/rsc"
import type { RootProviderProps } from "renoun/components"

import type { DocConfig } from "@pkgdocs/ui"

type Simplify<T> = { [K in keyof T]: T[K] } & {}
type RenounConfig = Simplify<Omit<RootProviderProps<undefined>, "children">>

export interface DocConfigFile {
  layout?: string
  defaultTheme?: "light" | "dark" | "system"
  ui?: Partial<DocConfig>
  betterThemes?: Partial<BetterThemesProps>
  renoun?: RenounConfig
}
