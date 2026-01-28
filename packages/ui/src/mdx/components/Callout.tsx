import type { ReactNode } from "react"

export function Callout({
  type = "info",
  children,
}: {
  type?: "info" | "warn" | "error"
  children: ReactNode
}) {
  return <div className={`callout callout-${type}`}>{children}</div>
}
