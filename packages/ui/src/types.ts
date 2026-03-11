import type { ComponentProps, PropsWithChildren, ReactNode } from "react"

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

export interface DocConfig {
  layoutKey: string
  framework?: FrameworkCapabilities
  options?: {
    sidebar?: "left" | "right" | "none"
    contentWidth?: string
    showBreadcrumbs?: boolean
  }
  theme?: {
    colors?: { bg?: string; fg?: string; accent?: string; muted?: string }
    font?: { body?: string; mono?: string; size?: string; lineHeight?: number }
    radius?: string
    spacing?: { x?: string; y?: string }
  }
  features?: {
    toc?: boolean
    search?: "none" | "local" | "algolia"
    breadcrumbs?: boolean
  }
}

export type LayoutProps = PropsWithChildren<{ config: DocConfig }>
