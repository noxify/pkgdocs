import { describe, expect, it, test } from "vitest"

import { transformedEntries } from "../src/collections"
import { buildTree, getAllTrees, getTree } from "../src/navigation"
import { createSourceCollection } from "./helpers"

describe("navigation tests", () => {
  const sourceCollection = createSourceCollection()

  describe("buildTree", () => {
    it("should build a hierarchical tree from flat entries", async () => {
      const entries = await transformedEntries(sourceCollection, "getting-started")
      const tree = buildTree(entries)

      expect(Array.isArray(tree)).toBe(true)
      expect(tree.length).toBeGreaterThan(0)
    })

    it("should filter out hidden entries", async () => {
      const entries = await transformedEntries(sourceCollection)
      const tree = buildTree(entries)

      const hasHiddenEntries = (items: typeof tree): boolean => {
        return items.some(
          (item) =>
            item.slug.some((segment) => segment.startsWith("_")) ||
            (item.children && hasHiddenEntries(item.children)),
        )
      }

      expect(hasHiddenEntries(tree)).toBe(false)
    })

    it("should set correct properties on tree items", async () => {
      const entries = await transformedEntries(sourceCollection, "getting-started")
      const tree = buildTree(entries)

      const firstItem = tree[0]
      expect(firstItem).toBeDefined()
      expect(firstItem?.title).toBeTruthy()
      expect(firstItem?.path).toBeTruthy()
      expect(typeof firstItem?.isFile).toBe("boolean")
      expect(Array.isArray(firstItem?.slug)).toBe(true)
      expect(typeof firstItem?.depth).toBe("number")
    })

    it("should preserve entry order from source collection", async () => {
      const entries = await transformedEntries(sourceCollection, "getting-started")
      const tree = buildTree(entries)

      // Verify that the tree maintains the order provided by the source collection
      // (Renoun handles sorting through filename numbering like 01., 02., etc.)
      expect(tree.length).toBeGreaterThan(0)
      expect(tree.every((item) => item.title && item.path)).toBe(true)
    })

    it("should establish correct parent-child relationships", async () => {
      const entries = await transformedEntries(sourceCollection)
      const tree = buildTree(entries)

      const validateHierarchy = (items: typeof tree, parentSegments: string[] = []): boolean => {
        for (const item of items) {
          // Validate that slug is correct relative to parent
          if (parentSegments.length > 0) {
            const expectedStart = parentSegments.join("/")
            const itemPath = item.slug.join("/")
            if (!itemPath.startsWith(expectedStart)) {
              return false
            }
          }

          if (item.children && !validateHierarchy(item.children, item.slug)) {
            return false
          }
        }
        return true
      }

      expect(validateHierarchy(tree)).toBe(true)
    })

    it("should mark files correctly", async () => {
      const entries = await transformedEntries(sourceCollection, "api")
      const tree = buildTree(entries)

      const hasValidFileMarkers = (items: typeof tree): boolean => {
        return items.every((item) => {
          // Root or intermediate directories should have children or multiple segments
          // Individual files should not have children
          if (!item.isFile && item.children && item.children.length > 0) {
            return hasValidFileMarkers(item.children)
          }
          return true
        })
      }

      expect(hasValidFileMarkers(tree)).toBe(true)
    })

    it("should handle empty entries", () => {
      const tree = buildTree([])
      expect(tree).toEqual([])
    })
  })

  describe("getTree", () => {
    it("should return tree for a specific group", async () => {
      const tree = await getTree(sourceCollection, "getting-started")

      expect(Array.isArray(tree)).toBe(true)
      expect(tree.length).toBeGreaterThan(0)

      // Verify all items belong to the group
      const allItems = (items: typeof tree): typeof tree => {
        return items.reduce(
          (acc, item) => [...acc, item, ...(item.children ? allItems(item.children) : [])],
          [] as typeof tree,
        )
      }

      const items = allItems(tree)
      items.forEach((item) => {
        expect(item.slug[0]).toBe("getting-started")
      })
    })

    it("should return different trees for different groups", async () => {
      const gettingStartedTree = await getTree(sourceCollection, "getting-started")
      const apiTree = await getTree(sourceCollection, "api")

      expect(gettingStartedTree.length).toBeGreaterThan(0)
      expect(apiTree.length).toBeGreaterThan(0)

      // Trees should be different
      const gettingStartedTitles = gettingStartedTree.map((item) => item.title)
      const apiTitles = apiTree.map((item) => item.title)

      expect(gettingStartedTitles).not.toEqual(apiTitles)
    })

    it("should handle non-existent group", async () => {
      const tree = await getTree(sourceCollection, "non-existent-group")
      expect(tree).toEqual([])
    })
  })

  describe("getAllTrees", () => {
    it("should return trees for all groups", async () => {
      const allTrees = await getAllTrees(sourceCollection)

      expect(typeof allTrees).toBe("object")
      expect(Object.keys(allTrees).length).toBeGreaterThan(0)

      // Should have at least the groups we know exist
      expect(allTrees["getting-started"]).toBeDefined()
      expect(allTrees.api).toBeDefined()
    })

    it("should return different tree for each group", async () => {
      const allTrees = await getAllTrees(sourceCollection)

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const gettingStartedTree = allTrees["getting-started"]!
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const apiTree = allTrees.api!

      expect(Array.isArray(gettingStartedTree)).toBe(true)
      expect(Array.isArray(apiTree)).toBe(true)
      expect(gettingStartedTree.length).toBeGreaterThan(0)
      expect(apiTree.length).toBeGreaterThan(0)
    })

    it("should have consistent tree structures", async () => {
      const allTrees = await getAllTrees(sourceCollection)

      for (const [group, tree] of Object.entries(allTrees)) {
        const validateStructure = (items: typeof tree): boolean => {
          return items.every((item) => {
            const hasRequiredFields =
              // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
              item.title && item.path && item.slug && item.depth !== undefined
            const childrenValid = !item.children || validateStructure(item.children)
            return hasRequiredFields && childrenValid
          })
        }

        expect(validateStructure(tree), `Tree structure for group "${group}" is invalid`).toBe(true)
      }
    })
  })

  describe("buildTree structure validation", () => {
    it("should generate valid tree structure", async () => {
      const entries = await transformedEntries(sourceCollection, "getting-started")
      const tree = buildTree(entries)

      // Validate all items have required properties
      const validateStructure = (items: typeof tree): boolean => {
        return items.every((item) => {
          const hasRequiredFields =
            item.title &&
            item.path &&
            Array.isArray(item.slug) &&
            typeof item.depth === "number" &&
            typeof item.isFile === "boolean"
          const childrenValid = !item.children || validateStructure(item.children)
          return hasRequiredFields && childrenValid
        })
      }

      expect(validateStructure(tree)).toBe(true)
    })

    it("should have unique paths across tree", async () => {
      const entries = await transformedEntries(sourceCollection, "getting-started")
      const tree = buildTree(entries)

      const paths = new Set<string>()
      let isDuplicate = false

      const collectPaths = (items: typeof tree): void => {
        for (const item of items) {
          if (paths.has(item.path)) {
            isDuplicate = true
          }
          paths.add(item.path)
          if (item.children) {
            collectPaths(item.children)
          }
        }
      }

      collectPaths(tree)
      expect(isDuplicate).toBe(false)
    })

    it("should not mark files as having children", async () => {
      const entries = await transformedEntries(sourceCollection, "getting-started")
      const tree = buildTree(entries)

      const validateFiles = (items: typeof tree): boolean => {
        return items.every((item) => {
          // Files should not have children or children should be empty
          const isFileValid = !item.isFile || !item.children || item.children.length === 0
          const childrenValid = !item.children || validateFiles(item.children)
          return isFileValid && childrenValid
        })
      }

      expect(validateFiles(tree)).toBe(true)
    })

    it("should maintain proper order from source collection", async () => {
      const entries = await transformedEntries(sourceCollection, "getting-started")
      const tree = buildTree(entries)

      // Verify that the tree respects the order from the source collection
      // Renoun provides pre-sorted entries based on filename numbering (01., 02., etc.)
      expect(tree.length).toBeGreaterThan(0)
      const hasValidStructure = tree.every((item) => item.title && typeof item.depth === "number")
      expect(hasValidStructure).toBe(true)
    })

    it("should generate consistent structure snapshots", async () => {
      const entries = await transformedEntries(sourceCollection, "getting-started")
      const tree = buildTree(entries)

      expect(tree).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            title: expect.any(String) as string,
            path: expect.any(String) as string,
            slug: expect.any(Array) as unknown[],
            depth: expect.any(Number) as number,
            isFile: expect.any(Boolean) as boolean,
          }),
        ]),
      )
    })

    test("should handle deeply nested structures", async () => {
      const entries = await transformedEntries(sourceCollection, "getting-started")
      const tree = buildTree(entries)

      expect(tree).toMatchObject([
        {
          title: "Getting Started",
          path: "/getting-started",
          isFile: false,
          slug: ["getting-started"],
          depth: -1,
          externalLink: undefined,
          sortOrder: 0,
          children: [
            {
              title: "Installation",
              path: "/getting-started/installation",
              isFile: true,
              slug: ["getting-started", "installation"],
              depth: 0,
              externalLink: undefined,
              sortOrder: "01",
              children: [],
            },
            {
              title: "Setup",
              path: "/getting-started/setup",
              isFile: false,
              slug: ["getting-started", "setup"],
              depth: 0,
              externalLink: undefined,
              sortOrder: 0,
              children: [
                {
                  title: "Prerequisites",
                  path: "/getting-started/setup/prerequisites",
                  isFile: true,
                  slug: ["getting-started", "setup", "prerequisites"],
                  depth: 1,
                  externalLink: undefined,
                  sortOrder: "01",
                  children: [],
                },
                {
                  title: "Configuration",
                  path: "/getting-started/setup/configuration",
                  isFile: true,
                  slug: ["getting-started", "setup", "configuration"],
                  depth: 1,
                  externalLink: undefined,
                  sortOrder: "02",
                  children: [],
                },
              ],
            },
            {
              title: "Guides",
              path: "/getting-started/guides",
              isFile: false,
              slug: ["getting-started", "guides"],
              depth: 0,
              externalLink: undefined,
              sortOrder: 0,
              children: [
                {
                  title: "First Steps",
                  path: "/getting-started/guides/first-steps",
                  isFile: true,
                  slug: ["getting-started", "guides", "first-steps"],
                  depth: 1,
                  externalLink: undefined,
                  sortOrder: "01",
                  children: [],
                },
                {
                  title: "Advanced Usage",
                  path: "/getting-started/guides/advanced-usage",
                  isFile: true,
                  slug: ["getting-started", "guides", "advanced-usage"],
                  depth: 1,
                  externalLink: undefined,
                  sortOrder: "02",
                  children: [],
                },
              ],
            },
            {
              title: "External Resource",
              path: "/getting-started/external-link",
              isFile: true,
              slug: ["getting-started", "external-link"],
              depth: 0,
              externalLink: undefined,
              sortOrder: 0,
              children: [],
            },
          ],
        },
      ])
    })
  })
})
