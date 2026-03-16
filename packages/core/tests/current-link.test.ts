import { describe, expect, it } from "vitest"

import type { TreeItem } from "../src/navigation"
import { current, currentLink } from "../src/current-link"

function createTreeItem(overrides: Partial<TreeItem>): TreeItem {
  return {
    title: "Item",
    path: "/api/reference",
    isFile: false,
    hasFile: true,
    slug: ["api", "reference"],
    depth: 2,
    children: [],
    ...overrides,
  }
}

describe("currentLink", () => {
  it("returns true for exact item path", () => {
    const item = createTreeItem({})

    expect(currentLink({ pathname: "/api/reference", item })).toBe(true)
  })

  it("returns true for nested routes of item path", () => {
    const item = createTreeItem({})

    expect(currentLink({ pathname: "/api/reference/resolve-href", item })).toBe(true)
  })

  it("returns true when child path matches", () => {
    const item = createTreeItem({
      children: [
        createTreeItem({
          title: "Child",
          path: "/guides",
          slug: ["guides"],
          depth: 1,
        }),
      ],
    })

    expect(currentLink({ pathname: "/guides/getting-started", item })).toBe(true)
  })

  it("returns false for unrelated paths", () => {
    const item = createTreeItem({})

    expect(currentLink({ pathname: "/blog/post", item })).toBe(false)
  })

  it("exposes current as alias for currentLink", () => {
    const item = createTreeItem({})

    expect(current({ pathname: "/api/reference", item })).toBe(
      currentLink({ pathname: "/api/reference", item }),
    )
  })
})
