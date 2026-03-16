import type { ThemeProviderProps as BetterThemesProps } from "better-themes/rsc"
import type { RootProviderProps } from "renoun/components"
import * as v from "valibot"

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

export const FrameworkConfigSchema = v.object({
  prefetch: v.optional(v.boolean()),
  useOptimizedImage: v.optional(v.boolean()),
})

export const DocConfigFileSchema = v.object({
  layout: v.optional(v.string()),
  defaultTheme: v.optional(v.picklist(["light", "dark", "system"])),
  framework: v.optional(FrameworkConfigSchema),
  ui: v.optional(v.custom<Partial<DocConfig>>(() => true)),
  betterThemes: v.optional(v.custom<Partial<BetterThemesProps>>(() => true)),
  renoun: v.optional(v.custom<RenounConfig>(() => true)),
})

export type FrameworkConfig = v.InferOutput<typeof FrameworkConfigSchema>
export type DocConfigFile = v.InferOutput<typeof DocConfigFileSchema>
