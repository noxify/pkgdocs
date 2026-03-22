import type { FC, PropsWithChildren } from "react"

import type { DocConfigFile } from "@pkgdocs/config"

import { ClassicLayout } from "../layouts/classic"
import { MinimalLayout } from "../layouts/minimal"

type LayoutComp = FC<PropsWithChildren<{ config: DocConfigFile }>>

export const layoutRegistry: Record<string, LayoutComp> = {
  classic: ClassicLayout,
  minimal: MinimalLayout,
}

export function resolveLayout(key: string): LayoutComp {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return layoutRegistry[key] ?? layoutRegistry.classic!
}
