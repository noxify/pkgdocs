import { cache } from "react"

/**
 * Helper to make cache optional for build-time usage.
 * Uses React's cache in RSC environments, falls back to Map-based cache otherwise.
 *
 * @template TArgs - The function parameter types
 * @template TReturn - The function return type
 * @param fn - The function to cache
 * @returns The cached version of the function
 */
export const optionalCache = <TArgs extends readonly unknown[], TReturn>(
  fn: (...args: TArgs) => TReturn,
): ((...args: TArgs) => TReturn) => {
  try {
    return cache(fn)
  } catch {
    // Fallback to Map-based cache for Node.js context
    const cacheMap = new Map<string, TReturn>()

    return (...args: TArgs): TReturn => {
      const key = JSON.stringify(args)
      if (cacheMap.has(key)) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return cacheMap.get(key)!
      }
      const result = fn(...args)
      cacheMap.set(key, result)
      return result
    }
  }
}
