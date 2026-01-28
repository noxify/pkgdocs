import type { LayoutProps } from "../../types"

export function ClassicLayout({ children, config }: LayoutProps) {
  const sidebar = config.options?.sidebar ?? "left"
  const contentWidth = config.options?.contentWidth ?? "72ch"

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
