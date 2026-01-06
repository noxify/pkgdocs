import { describe, expect, it } from "vitest"

import { testFunction } from "~/index"

describe("Core", () => {
  it("should pass a simple test", () => {
    expect(true).toBe(true)
  })

  it("should import via path alias", () => {
    const result = testFunction()
    expect(result).toEqual({
      foo: "hello",
      bar: 42,
    })
  })
})
