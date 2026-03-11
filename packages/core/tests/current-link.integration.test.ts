import { describe, expect, it } from "vitest"

import { transformedEntries } from "../src/collections"
import { currentLink } from "../src/current-link"
import { buildTree } from "../src/navigation"
import { createSourceCollection } from "./helpers"

describe("currentLink integration", () => {
  const sourceCollection = createSourceCollection()

  it("marks parent and descendant routes as active for built tree items", async () => {
    const entries = await transformedEntries(sourceCollection, "getting-started")
    const tree = buildTree(entries)

    const parentWithChildren = tree.find((item) => (item.children?.length ?? 0) > 0)
    expect(parentWithChildren).toBeDefined()

    if (!parentWithChildren) {
      return
    }

    const firstChild = parentWithChildren.children?.[0]

    expect(currentLink({ pathname: parentWithChildren.path, item: parentWithChildren })).toBe(true)
    expect(
      currentLink({
        pathname: `${parentWithChildren.path}/deep/segment`,
        item: parentWithChildren,
      }),
    ).toBe(true)

    if (firstChild) {
      expect(currentLink({ pathname: firstChild.path, item: parentWithChildren })).toBe(true)
    }

    expect(currentLink({ pathname: "/__not-matching__", item: parentWithChildren })).toBe(false)
  })
})
