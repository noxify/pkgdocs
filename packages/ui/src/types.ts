import type { ComponentProps, PropsWithChildren, ReactNode } from "react"

import type { DocConfigFile } from "@pkgdocs/config"

export type FrameworkLinkProps = ComponentProps<"a"> & {
  prefetch?: boolean
}
export type FrameworkImageProps = ComponentProps<"img">

export interface FrameworkComponents {
  Link?: (props: FrameworkLinkProps) => ReactNode
  Image?: (props: FrameworkImageProps) => ReactNode
}

export interface FrameworkCapabilities {
  supportsPrefetch?: boolean
  hasOptimizedImage?: boolean
}

export interface FrameworkAdapter {
  components?: FrameworkComponents
  capabilities?: FrameworkCapabilities
}

export type LayoutProps = PropsWithChildren<{ config: DocConfigFile }>
