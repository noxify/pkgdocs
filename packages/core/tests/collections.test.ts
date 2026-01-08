import { isDirectory } from "renoun/file-system"
import { describe, expect, it } from "vitest"

import {
  getBreadcrumbItems,
  getChildEntries,
  getDirectory,
  getEntry,
  getFileContent,
  getFileForEntry,
  getMetadata,
  getRawEntry,
  getSiblings,
  isExternal,
  rootCollections,
  transformedEntries,
} from "../src/collections"
import { createSourceCollection } from "./helpers"

describe("collections tests", () => {
  const sourceCollection = createSourceCollection()

  describe("rootCollections", () => {
    it("should retrieve and transform root collections", async () => {
      const result = await rootCollections(sourceCollection)

      expect(result).toBeInstanceOf(Array)
      expect(result.length).toBeGreaterThan(0)

      const apiCollection = result.find((c) => c.group === "api")
      expect(apiCollection).toBeDefined()
      expect(apiCollection?.title).toBe("API Reference")
      expect(apiCollection?.entrypoint).toBe("/docs/api/overview")
    })

    it("should use default entrypoint when not specified", async () => {
      const result = await rootCollections(sourceCollection)

      const gettingStarted = result.find((c) => c.title === "Getting Started")
      expect(gettingStarted?.entrypoint).toMatch("/getting-started")
    })
  })

  describe("transformedEntries", () => {
    it("should transform all entries from source collection", async () => {
      const result = await transformedEntries(sourceCollection, "getting-started")

      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBeGreaterThan(0)

      const entry = result[0]
      expect(entry).toHaveProperty("fullPathname")
      expect(entry).toHaveProperty("relativePathname")
      expect(entry).toHaveProperty("segments")
      expect(entry).toHaveProperty("title")
      expect(entry).toHaveProperty("isDirectory")
    })

    it("should filter entries by group when provided", async () => {
      const allEntries = await rootCollections(sourceCollection)
      const filteredEntries = await transformedEntries(sourceCollection, "api")

      expect(filteredEntries.length).toBeLessThanOrEqual(allEntries.length)
    })
  })

  describe("getFileContent", () => {
    it("should retrieve file content for a path", async () => {
      const entries = await sourceCollection.getEntries()
      const entry = entries.find((e) => e.getPathname().includes("installation"))

      if (entry) {
        const file = await getFileContent(sourceCollection, entry)
        expect(file).not.toBeNull()
      }
    })

    it("should return null for non-existent files", async () => {
      const mockEntry = {
        getPathnameSegments: () => ["nonexistent", "path"],
        isDirectory: () => false,
      }

      const file = await getFileContent(sourceCollection, mockEntry as never)
      expect(file).toBeNull()
    })
  })

  describe("getMetadata", () => {
    it("should extract frontmatter from file", async () => {
      const entries = await sourceCollection.getEntries()
      const entry = entries.find((e) => e.getPathname().includes("installation"))

      if (entry) {
        const file = await getFileContent(sourceCollection, entry)
        const metadata = await getMetadata(file)

        expect(metadata).toBeDefined()
        expect(metadata?.title).toBe("Installation")
        expect(metadata?.description).toBe("How to install")
      }
    })

    it("should return undefined for null file", async () => {
      const metadata = await getMetadata(null)
      expect(metadata).toBeUndefined()
    })
  })

  describe("getEntry", () => {
    it("should transform entry into standardized format", async () => {
      const entries = await sourceCollection.getEntries()
      const rawEntry = entries[0]

      if (rawEntry) {
        const entry = await getEntry(sourceCollection, rawEntry)

        expect(entry).toHaveProperty("fullPathname")
        expect(entry).toHaveProperty("relativePathname")
        expect(entry).toHaveProperty("segments")
        expect(entry).toHaveProperty("title")
        expect(entry).toHaveProperty("path")
        expect(entry).toHaveProperty("isDirectory")
        expect(entry).toHaveProperty("sortOrder")
        expect(entry).toHaveProperty("depth")
        expect(entry).toHaveProperty("baseName")
        expect(entry).toHaveProperty("hasFile")
        expect(entry).toHaveProperty("group")
      }
    })
  })

  describe("getBreadcrumbItems", () => {
    it("should generate breadcrumb items from slug", async () => {
      const result = await getBreadcrumbItems(sourceCollection, ["getting-started", "installation"])

      expect(result).toBeInstanceOf(Array)
      expect(result.length).toBeGreaterThan(0)

      result.forEach((item) => {
        expect(item).toHaveProperty("title")
        expect(item).toHaveProperty("path")
      })
    })

    it("should filter out index from slug", async () => {
      const withIndex = await getBreadcrumbItems(sourceCollection, ["getting-started", "index"])
      const withoutIndex = await getBreadcrumbItems(sourceCollection, ["getting-started"])

      expect(withIndex.length).toBe(withoutIndex.length)
    })
  })

  describe("getChildEntries", () => {
    it("should return child entries for a directory", async () => {
      const entries = await sourceCollection.getEntries({ recursive: false })
      const directory = entries.find((e) => isDirectory(e) && e.baseName === "getting-started")

      expect(directory).toBeDefined()

      if (directory) {
        const children = await getChildEntries(sourceCollection, directory)

        expect(Array.isArray(children)).toBe(true)
        expect(children.length).toBeGreaterThan(0)

        // Check for expected child entries
        const childNames = children.map((c) => c.baseName)
        expect(childNames).toContain("installation")
        expect(childNames).toContain("external-link")

        // Verify child structure
        children.forEach((child) => {
          expect(child).toHaveProperty("title")
          expect(child).toHaveProperty("relativePathname")
          expect(child).toHaveProperty("baseName")
        })
      }
    })
  })

  describe("getSiblings", () => {
    it("should return previous and next entries", async () => {
      const allEntries = await transformedEntries(sourceCollection, "getting-started")
      const middleEntry = allEntries.find((e) => e.baseName === "installation")

      expect(middleEntry).toBeDefined()

      if (middleEntry) {
        const [prev, next] = await getSiblings(sourceCollection, middleEntry)

        // Installation should have a previous entry (getting-started ( = /getting-started/index.mdx ))
        expect(prev).toBeDefined()
        expect(prev?.baseName).toBe("getting-started")

        // Installation should not have a next entry (external-link)
        expect(next).toBeUndefined()

        // Verify sibling structure
        if (prev) {
          expect(prev).toHaveProperty("title")
          expect(prev).toHaveProperty("baseName")
        }
        if (next) {
          expect(next).toHaveProperty("title")
          expect(next).toHaveProperty("baseName")
        }
      }
    })

    it("should handle first entry with only next sibling", async () => {
      const allEntries = await transformedEntries(sourceCollection, "getting-started")
      const firstEntry = allEntries.find((e) => e.baseName === "getting-started")

      expect(firstEntry).toBeDefined()

      if (firstEntry) {
        const [prev, next] = await getSiblings(sourceCollection, firstEntry)

        // First entry should not have a previous entry
        expect(prev).toBeUndefined()

        // First entry should have a next entry (installation)
        expect(next).toBeDefined()
        expect(next?.baseName).toBe("installation")

        // Verify next structure
        if (next) {
          expect(next).toHaveProperty("title")
          expect(next).toHaveProperty("baseName")
        }
      }
    })
  })

  describe("isExternal", () => {
    it("should return true for entries with externalLink", async () => {
      const allEntries = await transformedEntries(sourceCollection, "getting-started")
      const externalEntry = allEntries.find((e) => e.relativePathname.includes("external"))

      if (externalEntry) {
        const result = await isExternal(sourceCollection, externalEntry)
        expect(result).toBe(true)
      }
    })

    it("should return false for regular entries", async () => {
      const allEntries = await transformedEntries(sourceCollection, "getting-started")
      const regularEntry = allEntries.find((e) => e.baseName === "installation")

      if (regularEntry) {
        const result = await isExternal(sourceCollection, regularEntry)
        expect(result).toBe(false)
      }
    })
  })

  describe("getRawEntry", () => {
    it("should retrieve raw entry from transformed entry", async () => {
      const allEntries = await transformedEntries(sourceCollection, "getting-started")
      const transformedEntry = allEntries[0]

      if (transformedEntry) {
        const rawEntry = await getRawEntry(sourceCollection, transformedEntry)
        expect(rawEntry).toBeDefined()
        expect(rawEntry.getPathname).toBeDefined()
      }
    })
  })

  describe("getFileForEntry", () => {
    it("should get file for transformed entry", async () => {
      const allEntries = await transformedEntries(sourceCollection, "getting-started")
      const entry = allEntries.find((e) => e.hasFile)

      if (entry) {
        const file = await getFileForEntry(sourceCollection, entry)
        expect(file).toBeDefined()
      }
    })
  })

  describe("getDirectory", () => {
    it("should retrieve directory for entry", async () => {
      const entries = await sourceCollection.getEntries({ recursive: false })
      const dirEntry = entries.find((e) => isDirectory(e))

      expect(dirEntry).toBeDefined()

      if (dirEntry) {
        const directory = await getDirectory(sourceCollection, dirEntry)
        expect(directory).toBeDefined()
        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(directory.getEntries).toBeDefined()
      }
    })
  })
})
