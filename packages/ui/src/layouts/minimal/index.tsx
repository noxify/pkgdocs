import type { LayoutProps } from "../../types"

export function MinimalLayout({ children }: LayoutProps) {
  return (
    <main
      style={{
        margin: "0 auto",
        maxWidth: "68ch",
        padding: "var(--space-y) var(--space-x)",
        color: "var(--color-fg)",
        background: "var(--color-bg)",
      }}
    >
      {children}
    </main>
  )
}
