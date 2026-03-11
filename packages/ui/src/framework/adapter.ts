import { createElement } from "react"

import type { FrameworkAdapter, FrameworkImageProps, FrameworkLinkProps } from "../types"

const defaultLink = (props: FrameworkLinkProps) => createElement("a", props)
const defaultImage = (props: FrameworkImageProps) => createElement("img", props)

export const defaultFrameworkAdapter: FrameworkAdapter = {
  components: {
    Link: defaultLink,
    Image: defaultImage,
  },
  capabilities: {
    supportsPrefetch: false,
    hasOptimizedImage: false,
  },
}

export function resolveFrameworkAdapter(adapter?: FrameworkAdapter): FrameworkAdapter {
  return {
    components: {
      Link: adapter?.components?.Link ?? defaultFrameworkAdapter.components?.Link,
      Image: adapter?.components?.Image ?? defaultFrameworkAdapter.components?.Image,
    },
    capabilities: {
      ...defaultFrameworkAdapter.capabilities,
      ...adapter?.capabilities,
    },
  }
}
