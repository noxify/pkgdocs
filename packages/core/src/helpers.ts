import type { EntryType, Frontmatter, TransformedEntry } from "./types"

/**
 * Helper function to get the title for an element in the sidebar/navigation
 */
export function getTitle(
  entry: EntryType,
  frontmatter?: Frontmatter,
  includeTitle = false,
): string {
  return includeTitle
    ? (frontmatter?.navTitle ?? frontmatter?.title ?? entry.title)
    : (frontmatter?.navTitle ?? entry.title)
}

/**
 * Recursively builds a flat list of all entries in the documentation
 */
export async function flattenEntries(entry: EntryType): Promise<EntryType[]> {
  if (rawIsHidden(entry)) {
    return []
  }

  const entries: EntryType[] = [entry]

  if ("getEntries" in entry) {
    const children = await entry.getEntries()
    const childEntries = await Promise.all(children.map((child) => flattenEntries(child)))
    entries.push(...childEntries.flat())
  }

  return entries
}

/**
 * Checks if a raw entry is hidden (starts with an underscore)
 */
export function rawIsHidden(entry: EntryType) {
  return entry.baseName.startsWith("_")
}

/**
 * Checks if an entry is hidden (starts with an underscore)
 */
export function isHidden(entry: TransformedEntry) {
  const lastSegment = entry.segments[entry.segments.length - 1]
  return lastSegment?.startsWith("_") ?? false
}

/**
 * Remove items from array
 */
export function removeFromArray<T>(array: T[], itemsToRemove: T[]): T[] {
  return array.filter((item) => !itemsToRemove.includes(item))
}

export function directoryFilter(entry: EntryType) {
  return (
    !entry.baseName.startsWith("_") &&
    !entry.baseName.startsWith(".") &&
    !entry.absolutePath.includes("_assets")
  )
}
