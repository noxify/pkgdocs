import { describe, expect, it, vi } from "vitest"

import type { EntryType, Frontmatter, TransformedEntry } from "../src/types"
import {
  directoryFilter,
  flattenEntries,
  getTitle,
  isHidden,
  rawIsHidden,
  removeFromArray,
} from "../src/helpers"

describe("getTitle", () => {
  const mockEntry: Pick<EntryType, "title"> = {
    title: "File Name",
  }

  it("should return navTitle when includeTitle is true and navTitle exists", () => {
    const frontmatter: Partial<Frontmatter> = {
      navTitle: "Nav Title",
      title: "Page Title",
    }

    expect(getTitle(mockEntry as EntryType, frontmatter as Frontmatter, true)).toBe("Nav Title")
  })

  it("should return title when includeTitle is true, navTitle is missing but title exists", () => {
    const frontmatter: Partial<Frontmatter> = {
      title: "Page Title",
    }

    expect(getTitle(mockEntry as EntryType, frontmatter as Frontmatter, true)).toBe("Page Title")
  })

  it("should return entry.title when includeTitle is true but frontmatter has no navTitle or title", () => {
    expect(getTitle(mockEntry as EntryType, undefined, true)).toBe("File Name")
  })

  it("should return navTitle when includeTitle is false and navTitle exists", () => {
    const frontmatter: Partial<Frontmatter> = {
      navTitle: "Nav Title",
      title: "Page Title",
    }

    expect(getTitle(mockEntry as EntryType, frontmatter as Frontmatter, false)).toBe("Nav Title")
  })

  it("should return entry.title when includeTitle is false and no navTitle", () => {
    const frontmatter: Partial<Frontmatter> = {
      title: "Page Title",
    }

    expect(getTitle(mockEntry as EntryType, frontmatter as Frontmatter, false)).toBe("File Name")
  })

  it("should return entry.title when no frontmatter provided", () => {
    expect(getTitle(mockEntry as EntryType, undefined, false)).toBe("File Name")
  })
})

describe("flattenEntries", () => {
  it("should return empty array for hidden entries", async () => {
    const hiddenEntry: Partial<EntryType> = {
      baseName: "_hidden",
    }

    const result = await flattenEntries(hiddenEntry as EntryType)
    expect(result).toEqual([])
  })

  it("should return single entry for file without children", async () => {
    const fileEntry: Partial<EntryType> = {
      baseName: "file.ts",
    }

    const result = await flattenEntries(fileEntry as EntryType)
    expect(result).toEqual([fileEntry])
  })

  it("should recursively flatten directory entries", async () => {
    const childFile: Partial<EntryType> = {
      baseName: "child.ts",
    }

    const parentDir: Partial<EntryType> = {
      baseName: "parent",
      getEntries: vi.fn().mockResolvedValue([childFile]),
    }

    const result = await flattenEntries(parentDir as EntryType)
    expect(result).toHaveLength(2)
    expect(result).toContain(parentDir)
    expect(result).toContain(childFile)
  })

  it("should skip hidden children in nested structure", async () => {
    const hiddenChild: Partial<EntryType> = {
      baseName: "_hidden",
    }

    const visibleChild: Partial<EntryType> = {
      baseName: "visible",
    }

    const parentDir: Partial<EntryType> = {
      baseName: "parent",
      getEntries: vi.fn().mockResolvedValue([hiddenChild, visibleChild]),
    }

    const result = await flattenEntries(parentDir as EntryType)
    expect(result).toHaveLength(2)
    expect(result).toContain(parentDir)
    expect(result).toContain(visibleChild)
    expect(result).not.toContain(hiddenChild)
  })
})

describe("rawIsHidden", () => {
  it("should return true for entries starting with underscore", () => {
    const hiddenEntry: Partial<EntryType> = {
      baseName: "_hidden",
    }

    expect(rawIsHidden(hiddenEntry as EntryType)).toBe(true)
  })

  it("should return false for regular entries", () => {
    const normalEntry: Partial<EntryType> = {
      baseName: "normal",
    }

    expect(rawIsHidden(normalEntry as EntryType)).toBe(false)
  })

  it("should return false for entries starting with dot", () => {
    const dotEntry: Partial<EntryType> = {
      baseName: ".gitignore",
    }

    expect(rawIsHidden(dotEntry as EntryType)).toBe(false)
  })
})

describe("isHidden", () => {
  it("should return true when last segment starts with underscore", () => {
    const entry: TransformedEntry = {
      segments: ["api", "_private"],
      fullPathname: "api/_private",
      relativePathname: "_private",
      title: "Private",
      path: "/path/to/file",
      isDirectory: true,
      sortOrder: 0,
      depth: 2,
      baseName: "_private",
      hasFile: false,
      group: "api",
    }

    expect(isHidden(entry)).toBe(true)
  })

  it("should return false when last segment does not start with underscore", () => {
    const entry: TransformedEntry = {
      segments: ["docs", "api", "public"],
      fullPathname: "/docs/api/public",
      relativePathname: "docs/api/public",
      title: "Public",
      path: "/path/to/file",
      isDirectory: true,
      sortOrder: 0,
      depth: 2,
      baseName: "public",
      hasFile: false,
      group: "docs",
    }

    expect(isHidden(entry)).toBe(false)
  })

  it("should return false for entry with empty segments", () => {
    const entry: TransformedEntry = {
      segments: [],
      fullPathname: "/",
      relativePathname: "",
      title: "Root",
      path: "/path/to/file",
      isDirectory: true,
      sortOrder: 0,
      depth: 0,
      baseName: "root",
      hasFile: false,
      group: "root",
    }

    expect(isHidden(entry)).toBe(false)
  })
})

describe("removeFromArray", () => {
  it("should remove specified items from array", () => {
    const array = [1, 2, 3, 4, 5]
    const toRemove = [2, 4]

    expect(removeFromArray(array, toRemove)).toEqual([1, 3, 5])
  })

  it("should return same array when nothing to remove", () => {
    const array = [1, 2, 3]
    const toRemove: number[] = []

    expect(removeFromArray(array, toRemove)).toEqual([1, 2, 3])
  })

  it("should work with string arrays", () => {
    const array = ["a", "b", "c", "d"]
    const toRemove = ["b", "d"]

    expect(removeFromArray(array, toRemove)).toEqual(["a", "c"])
  })

  it("should return empty array when all items are removed", () => {
    const array = [1, 2, 3]
    const toRemove = [1, 2, 3]

    expect(removeFromArray(array, toRemove)).toEqual([])
  })

  it("should not modify original array", () => {
    const array = [1, 2, 3, 4]
    const toRemove = [2, 3]
    const original = [...array]

    removeFromArray(array, toRemove)

    expect(array).toEqual(original)
  })
})

describe("directoryFilter", () => {
  it("should filter out entries starting with underscore", () => {
    const entry: Partial<EntryType> = {
      baseName: "_hidden",
      absolutePath: "/path/to/_hidden",
    }

    expect(directoryFilter(entry as EntryType)).toBe(false)
  })

  it("should filter out entries starting with dot", () => {
    const entry: Partial<EntryType> = {
      baseName: ".git",
      absolutePath: "/path/to/.git",
    }

    expect(directoryFilter(entry as EntryType)).toBe(false)
  })

  it("should filter out entries in _assets directory", () => {
    const entry: Partial<EntryType> = {
      baseName: "image.png",
      absolutePath: "/path/to/_assets/image.png",
    }

    expect(directoryFilter(entry as EntryType)).toBe(false)
  })

  it("should allow normal entries", () => {
    const entry: Partial<EntryType> = {
      baseName: "docs",
      absolutePath: "/path/to/docs",
    }

    expect(directoryFilter(entry as EntryType)).toBe(true)
  })

  it("should allow entries with assets in name but not in _assets directory", () => {
    const entry: Partial<EntryType> = {
      baseName: "assets-guide",
      absolutePath: "/path/to/assets-guide",
    }

    expect(directoryFilter(entry as EntryType)).toBe(true)
  })
})
