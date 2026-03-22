import type { ThemeProviderProps as BetterThemesProps } from "better-themes/rsc"
import type { RootProviderProps } from "renoun/components"
import * as v from "valibot"

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

export const PkgDocsConfigSchema = v.object({
  layout: v.string(),
  features: v.optional(
    v.object({
      toc: v.optional(v.boolean()),
      search: v.optional(v.union([v.literal(false), v.literal("orama-local")]), "orama-local"),
      breadcrumbs: v.optional(v.boolean()),
    }),
  ),
})

export const DocConfigFileSchema = v.object({
  framework: v.optional(FrameworkConfigSchema),
  pkgdocs: v.optional(PkgDocsConfigSchema),
  betterThemes: v.optional(v.custom<Partial<Omit<BetterThemesProps, "children">>>(() => true)),
  renoun: v.optional(v.custom<RenounConfig>(() => true)),
})

export type PkgDocsConfig = v.InferOutput<typeof PkgDocsConfigSchema>
export type FrameworkConfig = v.InferOutput<typeof FrameworkConfigSchema>
export type DocConfigFile = v.InferOutput<typeof DocConfigFileSchema>
