// cache.ts

/**
 * Internal: generic function type
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFn = (...args: readonly unknown[]) => any

/**
 * Default key generator for the polyfill.
 * Note: For tests and most build-time use cases this is sufficient.
 * If you need stronger guarantees, pass a custom key via opts.key.
 */
function defaultKey(args: readonly unknown[]): string {
  return JSON.stringify(args, (_, v) =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    typeof v === "function" ? `[[fn:${v.name ?? "anonymous"}]]` : v,
  )
}

interface OptionalCacheOptions<TArgs extends readonly unknown[]> {
  /**
   * Optional key builder used by the polyfill.
   * If provided, React.cache will be adapted by wrapping the cached function
   * to take a single key argument (string) and delegate the real args.
   */
  key?: (args: TArgs) => string
}

/**
 * Helper to make cache optional for build-time usage.
 * Uses React's cache in RSC environments, falls back to Map-based cache otherwise.
 *
 * - Promise deduplication: concurrent calls with same key share a single promise
 * - Errors are not cached: failing calls remove the entry
 * - When React.cache is used, clear/size are exposed as no-ops for API parity
 *
 * @template TArgs - The function parameter types
 * @template TReturn - The function return type
 * @param fn - The function to cache
 * @param opts - Optional configuration (custom key builder)
 * @returns The cached version of the function
 */
export function optionalCache<TArgs extends readonly unknown[], TReturn>(
  fn: (...args: TArgs) => TReturn,
  opts?: OptionalCacheOptions<TArgs>,
): ((...args: TArgs) => TReturn) & { clear: () => void; size: () => number } {
  // Try dynamic React.cache (avoids top-level import issues in non-RSC contexts)
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const React = require("react") as { cache?: <F extends AnyFn>(f: F) => F }

    if (React.cache && !opts?.key) {
      const cached = React.cache(fn as AnyFn)
      const wrapped: ((...args: TArgs) => TReturn) & { clear: () => void; size: () => number } =
        Object.assign(cached, {
          clear: () => {
            /* empty */
          },
          size: () => 0,
        })
      return wrapped
    }

    if (React.cache && opts?.key) {
      // Adapter to support custom keying with React.cache:
      // - cache a function taking (key, args)
      // - user-facing function computes key and forwards (key, args)
      const keyed = (key: string, args: TArgs) => fn(...args)
      const cached = React.cache(keyed as AnyFn)

      const wrappedFn = (...args: TArgs): TReturn => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const k = opts.key!(args)
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return cached(k, args)
      }

      const wrapped: ((...args: TArgs) => TReturn) & { clear: () => void; size: () => number } =
        Object.assign(wrappedFn, {
          clear: () => {
            /* empty */
          },
          size: () => 0,
        })

      return wrapped
    }
  } catch {
    // react not available – fall back to polyfill
  }

  // Polyfill with Map-based memoization
  const keyFn =
    opts?.key ??
    ((a: TArgs) => {
      return defaultKey(a)
    })

  const map = new Map<string, TReturn>()

  const wrappedFn = (...args: TArgs): TReturn => {
    const k = keyFn(args)
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    if (map.has(k)) return map.get(k)!

    const res = fn(...args)

    // Promise dedup and non-caching errors
    if (res && typeof (res as unknown as { then?: unknown }).then === "function") {
      const p: TReturn = Promise.resolve(res)
        .then((val) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ;(map as Map<string, any>).set(k, val)
          return val
        })
        .catch((err) => {
          map.delete(k)
          throw err
        }) as TReturn
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(map as Map<string, any>).set(k, p)
      return p
    }

    map.set(k, res)
    return res
  }

  const wrapped: ((...args: TArgs) => TReturn) & { clear: () => void; size: () => number } =
    Object.assign(wrappedFn, {
      clear: () => map.clear(),
      size: () => map.size,
    })

  return wrapped
}

/**
 * Convenience wrapper to cache a function using a deterministic key builder.
 * Works with both React.cache (via adapter) and the polyfill.
 *
 * @param fn - The function to cache
 * @param keyFn - Deterministic key builder mapping original args to a string
 */
export function cacheWithKey<A extends readonly unknown[], R>(
  fn: (...args: A) => R,
  keyFn: (...args: A) => string,
) {
  // Adapter: cached function receives (key, args), actual fn uses args
  const keyed = (key: string, args: A) => fn(...args)

  // optionalCache decides: React.cache (with adapter) or polyfill
  const cached = optionalCache(keyed)

  const wrappedFn = (...args: A): R => {
    const key = keyFn(...args)
    return cached(key, args)
  }

  type CachedFn = ((...args: A) => R) & {
    clear?: () => void
    size?: () => number
  }

  const wrapped: CachedFn = Object.assign(wrappedFn, {
    clear: cached.clear,
    size: cached.size,
  })

  return wrapped
}
