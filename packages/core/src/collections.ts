import { isDirectory, isFile } from "renoun/file-system"

import type { EntryType, Frontmatter, SourceCollection, TransformedEntry } from "./types"
import { cacheWithKey } from "./cache"
import { flattenEntries, getTitle, isHidden, removeFromArray } from "./helpers"

export type { EntryType } from "./types"

/**
 * Internal: stable object interning to build deterministic keys
 * across the lifetime of the process for object instances.
 */
const internIds = new WeakMap<object, string>()
let internSeq = 0
function internObj(o: object): string {
  let id = internIds.get(o)
  if (!id) {
    id = `o${++internSeq}`
    internIds.set(o, id)
  }
  return id
}

/**
 * Internal: key helper for SourceCollection.
 * If SourceCollection has a natural id (e.g. sc.id), prefer that over interning.
 */
const keyOfSC = (sc: SourceCollection) => {
  const key = `sc:${internObj(sc)}`
  return key
}

/**
 * Caches and returns the root collections from the source collection.
 * Retrieves all top-level collections with their metadata including title, entrypoint,
 * description and group.
 *
 * @param sourceCollection - The source collection to retrieve root collections from
 * @returns Promise resolving to an array of root collection objects with metadata
 */
export const rootCollections = cacheWithKey(
  async (sourceCollection: SourceCollection) => {
    const roots = await sourceCollection.getEntries({
      recursive: false,
      includeIndexAndReadmeFiles: true,
    })

    return await Promise.all(
      roots.filter(isDirectory).map(async (collection) => {
        const indexFile = await collection.getFile("index", "mdx")
        const frontmatter = await getMetadata(indexFile)

        return {
          title: getTitle(indexFile, frontmatter, true),
          entrypoint:
            frontmatter?.entrypoint ?? `${collection.getPathname({ includeBasePathname: true })}`,
          description: frontmatter?.description ?? "",
          group: collection.baseName,
        }
      }),
    )
  },
  // Deterministic key across process: SourceCollection identity + tag
  (sourceCollection) => `${keyOfSC(sourceCollection)}|rootCollections`,
)

/**
 * Caches and returns an array of transformed entries from the DocumentationGroup collection.
 * Flattens all entries from collections and transforms them into a serializable format.
 *
 * @param sourceCollection - The source collection to retrieve entries from
 * @param group - Optional group name to filter collections by
 * @returns Promise resolving to an array of transformed entries
 */
const transformedEntriesBase = cacheWithKey(
  async (sourceCollection: SourceCollection, group?: string) => {
    let collections = await sourceCollection.getEntries({
      recursive: false,
      includeIndexAndReadmeFiles: true,
    })

    if (group) {
      collections = collections.filter((ele) => {
        return ele.baseName === group
      })
    }

    // Flatten all entries from all collections
    const allEntries: EntryType[] = []
    for (const collection of collections) {
      const flattened = await flattenEntries(collection)
      allEntries.push(...flattened)
    }

    // Transform to serializable format
    const entries = await Promise.all(allEntries.map((entry) => getEntry(sourceCollection, entry)))

    return entries
  },
  // Key includes SourceCollection identity and group discriminator
  (sourceCollection, group) => `${keyOfSC(sourceCollection)}|transformedEntries|g:${group ?? "-"}`,
)

export function transformedEntries(sourceCollection: SourceCollection): Promise<TransformedEntry[]>
export function transformedEntries(
  sourceCollection: SourceCollection,
  group: string,
): Promise<TransformedEntry[]>
export function transformedEntries(
  sourceCollection: SourceCollection,
  group?: string,
): Promise<TransformedEntry[]> {
  return transformedEntriesBase(sourceCollection, group)
}

/**
 * Gets all child entries for the next level based on the current entry.
 * Returns the immediate child pages/directories of the given source entry.
 *
 * @param sourceCollection - The source collection containing the entries
 * @param source - The source entry to get child entries for
 * @returns Promise resolving to an array of transformed child entries from the next level
 */
export async function getChildEntries(sourceCollection: SourceCollection, source: EntryType) {
  if (source.depth > -1) {
    if (isDirectory(source)) {
      const parent = await (await getDirectory(sourceCollection, source)).getEntries()
      return await Promise.all(parent.map((ele) => getEntry(sourceCollection, ele)))
    }

    if (isFile(source) && source.baseName === "index") {
      const parent = await (await getDirectory(sourceCollection, source.getParent())).getEntries()
      return await Promise.all(parent.map((ele) => getEntry(sourceCollection, ele)))
    }
    return []
  } else {
    const parent = await (await getDirectory(sourceCollection, source)).getEntries()
    return await Promise.all(parent.map((ele) => getEntry(sourceCollection, ele)))
  }
}

/**
 * Helper function to get the breadcrumb items for a given slug.
 * Generates a breadcrumb navigation path based on the slug segments.
 *
 * @param sourceCollection - The source collection to retrieve entries from
 * @param slug - Array of slug segments representing the current path
 * @param allEntries - Optional pre-fetched array of all entries to avoid redundant queries
 * @returns Promise resolving to an array of breadcrumb items with title and path
 */
export const getBreadcrumbItems = async (
  sourceCollection: SourceCollection,
  slug: string[] = [],
  allEntries?: Awaited<ReturnType<typeof transformedEntries>>,
) => {
  const cleanedSlug = removeFromArray(slug, ["index"])
  const combinations = cleanedSlug.map((_, index) => cleanedSlug.slice(0, index + 1))

  const items: { title: string; path: string[] }[] = []
  const entries = allEntries ?? (await transformedEntries(sourceCollection, slug[0] ?? ""))

  for (const currentPageSegement of combinations) {
    const entry = entries.find((ele) => ele.fullPathname === `/${currentPageSegement.join("/")}`)

    if (!entry) {
      continue
    }

    items.push({
      title: entry.title,
      path: entry.segments,
    })
  }

  return items
}

/**
 * Gets a file from the documentation collection based on the source entry.
 * Attempts to retrieve the file by checking segment file, index file, and readme file in order.
 *
 * @param sourceCollection - The source collection to retrieve the file from
 * @param source - The source entry to get the file content for
 * @returns Promise resolving to the file object or null if not found
 */
export const getFileContent = cacheWithKey(
  async (sourceCollection: SourceCollection, source: EntryType) => {
    const segments = source.getPathnameSegments({
      includeBasePathname: true,
      includeDirectoryNamedSegment: true,
    })

    const [segmentFile, indexFile, readmeFile] = await Promise.all([
      isDirectory(source) ? null : sourceCollection.getFile(segments, "mdx").catch(() => null),
      sourceCollection.getFile([...segments, "index"], "mdx").catch(() => null),
      sourceCollection.getFile([...segments, "readme"], "mdx").catch(() => null),
    ])

    return segmentFile ?? indexFile ?? readmeFile ?? null
  },
  // Key includes SourceCollection identity and the absolute pathname of the Entry
  (sourceCollection, source) =>
    `${keyOfSC(sourceCollection)}|getFileContent|p:${source.absolutePath}`,
)

/**
 * Gets a directory from the documentation collection based on the source entry.
 * Handles special cases like excluding "docs" segments for examples directories.
 *
 * @param sourceCollection - The source collection to retrieve the directory from
 * @param source - The source entry to get the directory for
 * @returns Promise resolving to the directory object
 */
export async function getDirectory(
  sourceCollection: SourceCollection,
  source: EntryType,
): Promise<Awaited<ReturnType<SourceCollection["getDirectory"]>>> {
  const segments = source.getPathnameSegments({
    includeBasePathname: true,
    includeDirectoryNamedSegment: true,
  })

  return sourceCollection.getDirectory(segments)
}

/**
 * Retrieves the frontmatter metadata from a documentation file.
 * Extracts the exported "frontmatter" value from the file.
 *
 * @param file - The file to extract metadata from, or null
 * @returns Promise resolving to the frontmatter object or undefined if not found
 */
export const getMetadata = cacheWithKey(
  async (file: Awaited<ReturnType<typeof getFileContent>>) => {
    return ((await file?.getExportValue("frontmatter")) as Frontmatter | undefined) ?? undefined
  },
  // Use a stable identifier for "file" argument:
  // prefer file.path if available; otherwise fall back to interning
  (file) => `getMetadata|f:${file ? file.absolutePath : "null"}`,
)

/**
 * Gets the previous and next entries relative to the current entry.
 * Filters out hidden and external entries to build a clean navigation sequence.
 *
 * @param sourceCollection - The source collection containing the entries
 * @param source - The transformed entry to find siblings for
 * @returns Promise resolving to a tuple of [previousEntry, nextEntry], either can be undefined
 */
export async function getSiblings(
  sourceCollection: SourceCollection,
  source: TransformedEntry,
): Promise<[TransformedEntry | undefined, TransformedEntry | undefined]> {
  const allEntries = await transformedEntries(sourceCollection, source.group)

  const visibleEntries = []
  for (const entry of allEntries) {
    if (isHidden(entry) || (await isExternal(sourceCollection, entry))) {
      continue
    }
    visibleEntries.push(entry)
  }

  const seenPaths = new Set<string>()
  const uniqueEntries: TransformedEntry[] = []

  for (const entry of visibleEntries) {
    if (seenPaths.has(entry.fullPathname)) {
      continue
    }
    seenPaths.add(entry.fullPathname)
    uniqueEntries.push(entry)
  }

  const currentIndex = uniqueEntries.findIndex((e) => e.fullPathname === source.fullPathname)

  if (currentIndex === -1) {
    return [undefined, undefined]
  }

  const previousElement = currentIndex > 0 ? uniqueEntries[currentIndex - 1] : undefined
  const nextElement =
    currentIndex < uniqueEntries.length - 1 ? uniqueEntries[currentIndex + 1] : undefined

  return [previousElement, nextElement]
}

/**
 * Gets the file object for a transformed entry.
 * Converts the transformed entry back to its raw entry and retrieves the file content.
 *
 * @param sourceCollection - The source collection to retrieve the file from
 * @param transformedEntry - The transformed entry to get the file for
 * @returns Promise resolving to the file object or null if not found
 */
export const getFileForEntry = cacheWithKey(
  async (sourceCollection: SourceCollection, transformedEntry: TransformedEntry) => {
    const entry = await getRawEntry(sourceCollection, transformedEntry)
    return await getFileContent(sourceCollection, entry)
  },
  (sourceCollection, transformedEntry) =>
    `${keyOfSC(sourceCollection)}|getFileForEntry|p:${transformedEntry.fullPathname}`,
)

/**
 * Transforms a FileSystemEntry into a standardized object.
 * Creates a serializable representation with pathname, segments, title, and other metadata.
 *
 * @param sourceCollection - The source collection containing the entry
 * @param source - The file system entry to transform
 * @returns Promise resolving to a transformed entry object
 */
export const getEntry = cacheWithKey(
  async (sourceCollection: SourceCollection, source: EntryType) => {
    const file = await getFileContent(sourceCollection, source)

    const metadata = file ? await getMetadata(file) : null

    // Determine group by traversing to root collection (depth === -1)
    let current = source
    while (current.depth > -1) {
      current = current.getParent()
    }
    const group = current.baseName

    return {
      fullPathname: source.getPathname({ includeBasePathname: true }),
      relativePathname: source.getPathname({ includeBasePathname: false }),
      segments: source.getPathnameSegments({ includeBasePathname: true }),
      title: metadata ? getTitle(source, metadata, true) : getTitle(source, undefined, true),
      path: source.absolutePath,
      isDirectory: isDirectory(source),
      sortOrder: file?.order ?? 0,
      depth: source.depth,
      baseName: source.baseName,
      hasFile: file !== null,
      group,
    } as TransformedEntry
  },
  (sourceCollection, source) =>
    `${keyOfSC(sourceCollection)}|getEntry|p:${source.getPathname({
      includeBasePathname: true,
    })}`,
)

/**
 * Gets the raw entry object for a transformed entry based on its segments.
 * Retrieves the original file system entry from the transformed representation.
 *
 * @param sourceCollection - The source collection to retrieve the entry from
 * @param transformedEntry - The transformed entry to get the raw entry for
 * @returns Promise resolving to the raw entry object
 */
export const getRawEntry = cacheWithKey(
  async (sourceCollection: SourceCollection, transformedEntry: TransformedEntry) => {
    return await sourceCollection.getEntry(transformedEntry.segments)
  },
  (sourceCollection, transformedEntry) =>
    `${keyOfSC(sourceCollection)}|getRawEntry|p:${transformedEntry.fullPathname}`,
)

/**
 * Checks if a raw entry is external.
 * Determines if an entry has an externalLink in its frontmatter metadata.
 *
 * @param sourceCollection - The source collection containing the entry
 * @param entry - The raw entry to check
 * @returns Promise resolving to true if the entry is external, false otherwise
 */
async function rawIsExternal(sourceCollection: SourceCollection, entry: EntryType) {
  let metadata: Awaited<ReturnType<typeof getMetadata>>
  let file: Awaited<ReturnType<typeof getFileContent>>

  try {
    if (entry.getPathnameSegments().includes("index")) {
      file = await getFileContent(sourceCollection, entry.getParent())
    } else {
      file = await getFileContent(sourceCollection, entry)
    }

    metadata = await getMetadata(file)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e: unknown) {
    return false
  }

  if (!metadata?.externalLink) {
    return false
  }
  return true
}

/**
 * Checks if an entry is external.
 * Wrapper function that converts a transformed entry to raw entry and checks if it's external.
 *
 * @param sourceCollection - The source collection containing the entry
 * @param transformedEntry - The transformed entry to check
 * @returns Promise resolving to true if the entry is external, false otherwise
 */
export async function isExternal(
  sourceCollection: SourceCollection,
  transformedEntry: TransformedEntry,
) {
  try {
    const entry = await getRawEntry(sourceCollection, transformedEntry)
    return await rawIsExternal(sourceCollection, entry)
  } catch {
    return false
  }
}
