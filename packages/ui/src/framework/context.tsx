import type { PropsWithChildren } from "react"
import { createContext, useContext } from "react"

import type { FrameworkAdapter, FrameworkImageProps, FrameworkLinkProps } from "../types"

const defaultLink = (props: FrameworkLinkProps) => <a {...props} />
const defaultImage = (props: FrameworkImageProps) => <img {...props} />

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

const FrameworkContext = createContext<FrameworkAdapter>(defaultFrameworkAdapter)

export function FrameworkProvider({
  adapter,
  children,
}: PropsWithChildren<{ adapter?: FrameworkAdapter }>) {
  const value = resolveFrameworkAdapter(adapter)
  return <FrameworkContext.Provider value={value}>{children}</FrameworkContext.Provider>
}

export function useFrameworkAdapter(): FrameworkAdapter {
  return useContext(FrameworkContext)
}
