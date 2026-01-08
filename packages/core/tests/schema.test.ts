import { describe, expect, it } from "vitest"

import type { Frontmatter } from "../src/schema"
import { docSchema, frontmatterSchema } from "../src/schema"

describe("frontmatterSchema", () => {
  it("should validate a complete frontmatter object", () => {
    const validFrontmatter = {
      title: "Test Page",
      description: "A test page description",
      tags: ["test", "docs"],
      navTitle: "Test Nav",
      entrypoint: "/docs/test",
      toc: true,
      externalLink: "https://example.com",
      hideFromSectionGrid: false,
    }

    const result = frontmatterSchema.safeParse(validFrontmatter)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual(validFrontmatter)
    }
  })

  it("should validate an empty frontmatter object with defaults", () => {
    const result = frontmatterSchema.safeParse({})
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.toc).toBe(true)
      expect(result.data.hideFromSectionGrid).toBe(false)
    }
  })

  it("should validate partial frontmatter", () => {
    const partial = {
      title: "Partial Title",
      description: "Only some fields",
    }

    const result = frontmatterSchema.safeParse(partial)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.title).toBe("Partial Title")
      expect(result.data.description).toBe("Only some fields")
      expect(result.data.toc).toBe(true) // Default value
    }
  })

  it("should reject invalid externalLink", () => {
    const invalid = {
      externalLink: "not-a-url",
    }

    const result = frontmatterSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })

  it("should accept valid URL for externalLink", () => {
    const valid = {
      externalLink: "https://example.com/path",
    }

    const result = frontmatterSchema.safeParse(valid)
    expect(result.success).toBe(true)
  })

  it("should validate tags as array of strings", () => {
    const withTags = {
      tags: ["tag1", "tag2", "tag3"],
    }

    const result = frontmatterSchema.safeParse(withTags)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.tags).toEqual(["tag1", "tag2", "tag3"])
    }
  })

  it("should reject invalid tag types", () => {
    const invalidTags = {
      tags: ["valid", 123, true],
    }

    const result = frontmatterSchema.safeParse(invalidTags)
    expect(result.success).toBe(false)
  })

  it("should handle boolean toc field", () => {
    const withToc = {
      toc: false,
    }

    const result = frontmatterSchema.safeParse(withToc)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.toc).toBe(false)
    }
  })

  it("should handle boolean hideFromSectionGrid field", () => {
    const withHide = {
      hideFromSectionGrid: true,
    }

    const result = frontmatterSchema.safeParse(withHide)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.hideFromSectionGrid).toBe(true)
    }
  })

  it("should type infer correctly", () => {
    const frontmatter: Frontmatter = {
      title: "Test",
      toc: true,
      hideFromSectionGrid: false,
    }

    expect(frontmatter.title).toBe("Test")
  })
})

describe("docSchema", () => {
  it("should contain frontmatter and headings schemas", () => {
    expect(docSchema).toHaveProperty("frontmatter")
    expect(docSchema.frontmatter).toBe(frontmatterSchema)
  })

  it("should validate complete doc structure", () => {
    const validFrontmatter = {
      title: "Test Doc",
      description: "Test description",
    }

    const frontmatterResult = docSchema.frontmatter.safeParse(validFrontmatter)

    expect(frontmatterResult.success).toBe(true)
  })
})
