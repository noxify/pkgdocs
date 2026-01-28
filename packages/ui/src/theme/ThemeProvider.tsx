import type { PropsWithChildren } from "react"
import { useMemo } from "react"

import type { DocConfig } from "../types"
import { toCssVars } from "./tokens"

export function ThemeProvider({ config, children }: PropsWithChildren<{ config: DocConfig }>) {
  const style = useMemo(() => toCssVars(config.theme), [config.theme])

  return (
    <div style={style} className="doc-theme-root">
      {children}
    </div>
  )
}
