import type { ThemeProviderProps as BetterThemesProps } from "better-themes/rsc"
import type { RootProviderProps } from "renoun/components"

import type { DocConfig } from "@pkgdocs/ui"

type Simplify<T> = { [K in keyof T]: T[K] } & {}
type RemoveIndexSignature<T> = {
  [K in keyof T as string extends K
    ? never
    : number extends K
      ? never
      : symbol extends K
        ? never
        : K]: T[K]
}

type RenounConfig = Simplify<Omit<RemoveIndexSignature<RootProviderProps>, "children">>
export interface DocConfigFile {
  layout?: string
  defaultTheme?: "light" | "dark" | "system"
  ui?: Partial<DocConfig>
  betterThemes?: Partial<BetterThemesProps>
  renoun?: RenounConfig
}
