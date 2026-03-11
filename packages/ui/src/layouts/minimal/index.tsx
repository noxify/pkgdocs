import type { LayoutProps } from "../../types"

export function MinimalLayout({ children, config }: LayoutProps) {
  const hasOptimizedImage = config.framework?.hasOptimizedImage ?? false
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
