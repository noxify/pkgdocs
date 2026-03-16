"use client"

import type { LayoutProps } from "../../types"
import { useFrameworkAdapter } from "../../framework"

export function MinimalLayout({ children }: LayoutProps) {
  const { capabilities } = useFrameworkAdapter()
  const hasOptimizedImage = capabilities?.hasOptimizedImage ?? false

  const maxWidth = hasOptimizedImage ? "72ch" : "68ch"

  return (
    <main
      style={{
        margin: "0 auto",
        maxWidth,
        padding: "var(--space-y) var(--space-x)",
        color: "var(--color-fg)",
        background: "var(--color-bg)",
      }}
    >
      {children}
    </main>
  )
}
