import type { EntryType, Frontmatter, TransformedEntry } from "./types"

/**
 * Helper function to get the title for an element in the sidebar/navigation.
 * Determines the appropriate title based on frontmatter metadata and entry properties.
 *
 * @param entry - The entry to get the title from
 * @param frontmatter - Optional frontmatter metadata containing title overrides
 * @param includeTitle - When true, falls back to frontmatter.title if navTitle is missing
 * @returns The resolved title string for display in navigation or sidebars
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
 * Recursively builds a flat list of all entries in the documentation.
 * Traverses the entry tree and filters out hidden entries (those starting with underscore).
 *
 * @param entry - The root entry to start flattening from
 * @returns Promise resolving to a flat array of all visible entries in the tree
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
 * Checks if a raw entry is hidden based on its basename.
 * An entry is considered hidden if its basename starts with an underscore.
 *
 * @param entry - The raw entry to check
 * @returns True if the entry's basename starts with an underscore, false otherwise
 */
export function rawIsHidden(entry: EntryType) {
  return entry.baseName.startsWith("_")
}

/**
 * Checks if a transformed entry is hidden based on its segments.
 * An entry is considered hidden if its last segment starts with an underscore.
 *
 * @param entry - The transformed entry to check
 * @returns True if the last segment starts with an underscore, false otherwise
 */
export function isHidden(entry: TransformedEntry) {
  const lastSegment = entry.segments[entry.segments.length - 1]
  return lastSegment?.startsWith("_") ?? false
}

/**
 * Removes specified items from an array without modifying the original.
 *
 * @template T - The type of items in the array
 * @param array - The source array to filter
 * @param itemsToRemove - Array of items to remove from the source array
 * @returns A new array with the specified items removed
 */
export function removeFromArray<T>(array: T[], itemsToRemove: T[]): T[] {
  return array.filter((item) => !itemsToRemove.includes(item))
}

/**
 * Filter function for directory entries to exclude hidden files and asset directories.
 * Used with renoun's Directory filter option to control which entries are included.
 *
 * Filters out:
 * - Entries starting with underscore (_)
 * - Entries starting with dot (.)
 * - Entries inside _assets directories
 *
 * @param entry - The entry to check
 * @returns True if the entry should be included, false if it should be filtered out
 */
export function directoryFilter(entry: EntryType) {
  return (
    !entry.baseName.startsWith("_") &&
    !entry.baseName.startsWith(".") &&
    !entry.absolutePath.includes("_assets")
  )
}
