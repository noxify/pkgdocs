import type { SourceCollection, TransformedEntry } from "./types"
import { transformedEntries } from "./collections"
import { isHidden } from "./helpers"

export interface TreeItem {
  title: string
  path: string
  isFile: boolean
  slug: string[]
  depth: number
  externalLink?: string
  children?: TreeItem[]
  sortOrder?: number
  // Supports any icon library (Lucide, Material-UI, Ant Design, etc.)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon?: React.ComponentType<any>
}

/**
 * Builds a hierarchical tree structure from a flat list of entries.
 * Groups entries by their path segments and establishes parent-child relationships.
 *
 * @param entries - Flat array of transformed entries to build tree from
 * @returns Promise resolving to an array of root tree items with nested children
 */
export function buildTree(entries: readonly TransformedEntry[]): TreeItem[] {
  const rootItems: TreeItem[] = []
  const itemMap = new Map<string, TreeItem>()

  // Create tree items for all entries
  for (const entry of entries) {
    if (isHidden(entry)) {
      continue
    }

    const treeItem: TreeItem = {
      title: entry.title,
      path: entry.fullPathname,
      isFile: entry.isDirectory === false,
      slug: entry.segments,
      depth: entry.depth,
      externalLink: undefined,
      sortOrder: entry.sortOrder,
      children: [],
    }

    const pathKey = entry.fullPathname
    itemMap.set(pathKey, treeItem)
  }

  // Build parent-child relationships
  for (const entry of entries) {
    if (isHidden(entry)) {
      continue
    }

    const pathKey = entry.fullPathname
    const treeItem = itemMap.get(pathKey)

    if (!treeItem) {
      continue
    }

    // Find parent by checking if parent path exists in entries
    if (entry.segments.length > 1) {
      const parentSegments = entry.segments.slice(0, -1)
      const parentPathKey = `/${parentSegments.join("/")}`
      const parentItem = itemMap.get(parentPathKey)

      if (parentItem) {
        parentItem.children = parentItem.children ?? []
        parentItem.children.push(treeItem)
      } else {
        rootItems.push(treeItem)
      }
    } else {
      rootItems.push(treeItem)
    }
  }

  return rootItems
}

/**
 * Gets a tree structure for a specific documentation group.
 * Fetches all entries from the source collection for the given group and builds a hierarchical tree.
 *
 * @param sourceCollection - The source collection to retrieve entries from
 * @param group - The documentation group name (e.g., "getting-started", "api")
 * @returns Promise resolving to an array of root tree items with nested children
 */
export async function getTree(
  sourceCollection: SourceCollection,
  group: string,
): Promise<TreeItem[]> {
  const entries = await transformedEntries(sourceCollection, group)
  return buildTree(entries)
}

/**
 * Gets the complete tree structure for all documentation groups.
 * Builds separate tree hierarchies for each group in the source collection.
 *
 * @param sourceCollection - The source collection to retrieve entries from
 * @returns Promise resolving to an object mapping group names to their tree structures
 */
export async function getAllTrees(
  sourceCollection: SourceCollection,
): Promise<Record<string, TreeItem[]>> {
  // Fetch all entries without group filter to get entries from all groups
  const allEntries = await transformedEntries(sourceCollection)
  const groups = new Set(allEntries.map((entry) => entry.group))

  const trees: Record<string, TreeItem[]> = {}

  for (const group of groups) {
    const groupEntries = allEntries.filter((entry) => entry.group === group)
    trees[group] = buildTree(groupEntries)
  }

  return trees
}
