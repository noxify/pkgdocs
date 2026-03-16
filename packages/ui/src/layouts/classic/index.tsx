"use client"

import type { LayoutProps } from "../../types"
import { useFrameworkAdapter } from "../../framework"

export function ClassicLayout({ children, config }: LayoutProps) {
  const sidebar = config.options?.sidebar ?? "left"
  const contentWidth = config.options?.contentWidth ?? "72ch"
  const { capabilities } = useFrameworkAdapter()
  const supportsPrefetch = capabilities?.supportsPrefetch ?? false
  const hasOptimizedImage = capabilities?.hasOptimizedImage ?? false

  return (
    <div
      className="classic-layout"
      style={{
        display: "grid",
        gridTemplateColumns: sidebar === "none" ? "1fr" : "minmax(220px, 280px) 1fr",
        gap: "var(--space-x)",
        color: "var(--color-fg)",
        background: "var(--color-bg)",
        fontFamily: "var(--font-body)",
        fontSize: "var(--font-size)",
        lineHeight: "var(--line-height)",
      }}
    >
      {sidebar !== "none" && (
        <aside
          style={{
            order: sidebar === "left" ? 0 : 1,
            borderRight: sidebar === "left" ? "1px solid var(--color-muted)" : "none",
            borderLeft: sidebar === "right" ? "1px solid var(--color-muted)" : "none",
            padding: "var(--space-y) var(--space-x)",
          }}
        >
          Classic layout sidebar. You can customize this layout or create your own by following the
          documentation.
          <p style={{ color: "var(--color-muted)", marginTop: "0.75rem", fontSize: "0.875rem" }}>
            Routing prefetch: {supportsPrefetch ? "enabled" : "disabled"} | Optimized images:{" "}
            {hasOptimizedImage ? "enabled" : "disabled"}
          </p>
          {/* Navigation / TOC */}
        </aside>
      )}
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
