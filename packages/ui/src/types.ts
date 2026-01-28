import type { PropsWithChildren } from "react"

export interface DocConfig {
  layoutKey: string
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
