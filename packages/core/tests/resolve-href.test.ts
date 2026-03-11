import { describe, expect, it } from "vitest"

import { resolveHref } from "../src/resolve-href"

describe("resolveHref", () => {
  it("resolves relative paths against currentPath", () => {
    const result = resolveHref("intro", { currentPath: "/docs/setup/page" })

    expect(result).toBe("/docs/setup/intro")
  })

  it("applies locale prefix for non-default locale", () => {
    const result = resolveHref("/getting-started", {
      locale: "de",
      defaultLocale: "en",
      locales: ["en", "de"],
    })

    expect(result).toBe("/de/getting-started")
  })

  it("does not double-prefix locale", () => {
    const result = resolveHref("/de/getting-started", {
      locale: "de",
      defaultLocale: "en",
      locales: ["en", "de"],
    })

    expect(result).toBe("/de/getting-started")
  })

  it("applies basePath to pathname", () => {
    const result = resolveHref("/api/reference", {
      basePath: "/docs",
    })

    expect(result).toBe("/docs/api/reference")
  })

  it("keeps protocol, host, path and hash for absolute urls", () => {
    const result = resolveHref("https://example.com/docs?a=1#top")

    expect(result).toBe("https://example.com/docs?a=1#top")
  })

  it("uses currentPath as base when href is only a hash", () => {
    const result = resolveHref("#section-2", {
      currentPath: "/guide/intro?tab=api#old",
    })

    expect(result).toBe("/guide/intro?tab=api#section-2")
  })

  it("merges parsed search params over query object values", () => {
    const result = resolveHref({
      pathname: "/docs",
      query: {
        lang: "en",
        page: 1,
      },
      search: "?page=2&mode=full",
    })

    expect(result).toBe("/docs?lang=en&page=2&mode=full")
  })

  it("supports active matching pattern use case", () => {
    const pathname = "/api/reference/resolve-href"
    const itemPaths = ["/api/reference", "/guides"]

    const patterns = itemPaths
      .map((itemPath) => {
        const resolvedUrl = resolveHref(itemPath)
        return [resolvedUrl, `${resolvedUrl}/**`]
      })
      .flat()

    expect(patterns).toContain("/api/reference")
    expect(patterns).toContain("/api/reference/**")
    expect(pathname.startsWith("/api/reference/")).toBe(true)
  })
})
