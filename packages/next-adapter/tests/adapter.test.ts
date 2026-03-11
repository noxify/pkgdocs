import NextImage from "next/image"
import NextLink from "next/link"
import { describe, expect, it } from "vitest"

import { createNextFrameworkAdapter, nextAdapterOptionsFromFrameworkConfig } from "../src"

describe("nextAdapterOptionsFromFrameworkConfig", () => {
  it("maps framework next config into adapter options", () => {
    expect(
      nextAdapterOptionsFromFrameworkConfig({ prefetch: false, useOptimizedImage: true }),
    ).toEqual({
      prefetch: false,
      useOptimizedImage: true,
    })
  })

  it("returns undefined values when config is missing", () => {
    expect(nextAdapterOptionsFromFrameworkConfig(undefined)).toEqual({
      prefetch: undefined,
      useOptimizedImage: undefined,
    })
  })
})

describe("createNextFrameworkAdapter", () => {
  it("enables prefetch and optimized images by default", () => {
    const adapter = createNextFrameworkAdapter()

    expect(adapter.capabilities.supportsPrefetch).toBe(true)
    expect(adapter.capabilities.hasOptimizedImage).toBe(true)
  })

  it("uses NextLink for internal links", () => {
    const adapter = createNextFrameworkAdapter()
    const element = adapter.components.Link({ href: "/docs", children: "Docs" })

    expect(element).toBeTruthy()
    expect((element as { type: unknown }).type).toBe(NextLink)
  })

  it("uses native anchors for external links", () => {
    const adapter = createNextFrameworkAdapter()
    const element = adapter.components.Link({ href: "https://pkgdocs.dev", children: "Docs" })

    expect((element as { type: unknown }).type).toBe("a")
  })

  it("uses native anchors for hash links", () => {
    const adapter = createNextFrameworkAdapter()
    const element = adapter.components.Link({ href: "#intro", children: "Intro" })

    expect((element as { type: unknown }).type).toBe("a")
  })

  it("uses native anchors for mailto links", () => {
    const adapter = createNextFrameworkAdapter()
    const element = adapter.components.Link({ href: "mailto:team@pkgdocs.dev", children: "Mail" })

    expect((element as { type: unknown }).type).toBe("a")
  })

  it("uses native anchors for tel links", () => {
    const adapter = createNextFrameworkAdapter()
    const element = adapter.components.Link({ href: "tel:+491234567", children: "Call" })

    expect((element as { type: unknown }).type).toBe("a")
  })

  it("forwards configured prefetch to internal NextLink", () => {
    const adapter = createNextFrameworkAdapter({ prefetch: false })
    const element = adapter.components.Link({ href: "/docs", children: "Docs" })

    expect((element as { type: unknown }).type).toBe(NextLink)
    expect((element as { props: { prefetch?: boolean } }).props.prefetch).toBe(false)
  })

  it("uses native img when dimensions are missing", () => {
    const adapter = createNextFrameworkAdapter()
    const element = adapter.components.Image({ src: "/hero.png", alt: "Hero" })

    expect((element as { type: unknown }).type).toBe("img")
  })

  it("uses NextImage when src and dimensions are provided", () => {
    const adapter = createNextFrameworkAdapter()
    const element = adapter.components.Image({
      src: "/hero.png",
      alt: "Hero",
      width: 1200,
      height: 800,
    })

    expect((element as { type: unknown }).type).toBe(NextImage)
  })

  it("disables optimized images when configured", () => {
    const adapter = createNextFrameworkAdapter({ useOptimizedImage: false })
    const element = adapter.components.Image({
      src: "/hero.png",
      alt: "Hero",
      width: 1200,
      height: 800,
    })

    expect(adapter.capabilities.hasOptimizedImage).toBe(false)
    expect((element as { type: unknown }).type).toBe("img")
  })

  it("reflects prefetch capability from options", () => {
    const adapter = createNextFrameworkAdapter({ prefetch: false })

    expect(adapter.capabilities.supportsPrefetch).toBe(false)
  })

  it("applies mixed option overrides", () => {
    const adapter = createNextFrameworkAdapter({ prefetch: false, useOptimizedImage: true })

    expect(adapter.capabilities.supportsPrefetch).toBe(false)
    expect(adapter.capabilities.hasOptimizedImage).toBe(true)
  })
})
