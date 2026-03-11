import { describe, expect, it } from "vitest"

import { isActive } from "../src/is-active"

describe("isActive", () => {
  it("matches exact paths", () => {
    expect(isActive("/api", "/api")).toBe(true)
  })

  it("matches descendant paths with /** patterns", () => {
    expect(isActive("/api/reference/resolve-href", "/api/reference/**")).toBe(true)
  })

  it("supports multiple current paths", () => {
    expect(isActive(["/docs", "/api/reference"], "/api/reference")).toBe(true)
  })

  it("supports multiple check paths", () => {
    expect(isActive("/tutorials/setup", ["/guides/**", "/tutorials/**"])).toBe(true)
  })

  it("returns false when no pattern matches", () => {
    expect(isActive("/blog", ["/api/**", "/docs/**"])).toBe(false)
  })
})
