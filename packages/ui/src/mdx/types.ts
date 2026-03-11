import type { MDXComponents } from "mdx/types"

import type { FrameworkAdapter } from "../types"

export type MdxComponents = MDXComponents

export interface CreateMdxOptions {
  adapter?: FrameworkAdapter
  overrides?: Partial<MdxComponents>
}
