import type { TreeItem } from "./navigation"
import { isActive } from "./is-active"
import { resolveHref } from "./resolve-href"

interface CurrentLinkOptions {
  pathname: string
  item: Pick<TreeItem, "path" | "children">
}

function buildCheckPatterns(item: Pick<TreeItem, "path" | "children">): string[] {
  const candidatePaths = [item.path, ...(item.children ?? []).map((child) => child.path)]

  return candidatePaths
    .map((path) => {
      const resolvedUrl = resolveHref(path)
      return [resolvedUrl, `${resolvedUrl}/**`]
    })
    .flat()
}

export function currentLink({ pathname, item }: CurrentLinkOptions): boolean {
  return isActive(pathname, buildCheckPatterns(item))
}

export const current = currentLink
