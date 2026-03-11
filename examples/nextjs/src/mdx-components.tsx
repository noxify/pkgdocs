import type { MDXComponents } from "mdx/types"

import { nextMdxComponents } from "~/lib/framework-adapter"

const components: MDXComponents = nextMdxComponents

export function useMDXComponents(): MDXComponents {
  return components
}
