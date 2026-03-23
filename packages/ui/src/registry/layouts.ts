import type { FC, PropsWithChildren } from "react"

import type { DocConfig } from "@pkgdocs/config"

import { MinimalLayout } from "../layouts/minimal"
import { PkgdocsLayout } from "../layouts/pkgdocs"

type LayoutComp = FC<PropsWithChildren<{ config: DocConfig }>>

export const layoutRegistry: Record<string, LayoutComp> = {
  pkgdocs: PkgdocsLayout,
  minimal: MinimalLayout,
}

export function resolveLayout(key: string): LayoutComp {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return layoutRegistry[key] ?? layoutRegistry.pkgdocs!
}
