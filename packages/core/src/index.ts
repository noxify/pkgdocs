export interface TestInterface {
  foo: string
  bar: number
}

export function testFunction(): TestInterface {
  return {
    foo: "hello",
    bar: 42,
  }
}
