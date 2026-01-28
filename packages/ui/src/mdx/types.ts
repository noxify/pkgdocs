import type { ComponentProps, ReactNode } from "react"

export interface MdxComponents {
  a?: (p: ComponentProps<"a">) => ReactNode
  pre?: (p: ComponentProps<"pre">) => ReactNode
  code?: (p: ComponentProps<"code">) => ReactNode
  img?: (p: ComponentProps<"img">) => ReactNode
  h1?: (p: ComponentProps<"h1">) => ReactNode
  h2?: (p: ComponentProps<"h2">) => ReactNode
  Callout?: (p: { type?: "info" | "warn" | "error"; children: ReactNode }) => ReactNode
  CodeBlock?: (p: { lang?: string; children: string }) => ReactNode
}

export interface CreateMdxOptions {
  overrides?: Partial<MdxComponents>
}
