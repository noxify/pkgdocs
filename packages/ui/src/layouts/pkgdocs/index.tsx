"use client"

import type { LayoutProps } from "../../types"
import { useFrameworkAdapter } from "../../framework"

export function PkgdocsLayout({ children }: LayoutProps) {
  const contentWidth = "72ch"
  const { capabilities } = useFrameworkAdapter()
  const supportsPrefetch = capabilities?.supportsPrefetch ?? false
  const hasOptimizedImage = capabilities?.hasOptimizedImage ?? false

  return (
    <div
      className="pkgdocs-layout"
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(220px, 280px) 1fr",
        gap: "var(--space-x)",
        color: "var(--color-fg)",
        background: "var(--color-bg)",
        fontFamily: "var(--font-body)",
        fontSize: "var(--font-size)",
        lineHeight: "var(--line-height)",
      }}
    >
      (
      <aside
        style={{
          order: 0,
          borderRight: "1px solid var(--color-muted)",
          borderLeft: "1px solid var(--color-muted)",
          padding: "var(--space-y) var(--space-x)",
        }}
      >
        Pkgdocs layout sidebar. You can customize this layout or create your own by following the
        documentation.
        <p style={{ color: "var(--color-muted)", marginTop: "0.75rem", fontSize: "0.875rem" }}>
          Routing prefetch: {supportsPrefetch ? "enabled" : "disabled"} | Optimized images:{" "}
          {hasOptimizedImage ? "enabled" : "disabled"}
        </p>
        {/* Navigation / TOC */}
      </aside>
      <main
        style={{
          maxWidth: contentWidth,
          padding: "var(--space-y) var(--space-x)",
        }}
      >
        {children}
      </main>
    </div>
  )
}
