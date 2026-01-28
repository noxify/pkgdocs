import type { CSSProperties } from "react"

import type { DocConfig } from "../types"

export function toCssVars(cfg: DocConfig["theme"] = {}): CSSProperties {
  const colors = cfg.colors ?? {}
  const font = cfg.font ?? {}
  const spacing = cfg.spacing ?? {}
  const radius = cfg.radius ?? "8px"

  return {
    "--color-bg": colors.bg ?? "#ffffff",
    "--color-fg": colors.fg ?? "#0f172a",
    "--color-accent": colors.accent ?? "#2563eb",
    "--color-muted": colors.muted ?? "#64748b",
    "--font-body": font.body ?? "Inter, system-ui, sans-serif",
    "--font-mono": font.mono ?? "ui-monospace, monospace",
    "--font-size": font.size ?? "16px",
    "--line-height": String(font.lineHeight ?? 1.6),
    "--radius": radius,
    "--space-x": spacing.x ?? "1rem",
    "--space-y": spacing.y ?? "1rem",
  } as CSSProperties
}
