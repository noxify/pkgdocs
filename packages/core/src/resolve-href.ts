/**
 * Type definition for URL objects (compatible with Node.js url module)
 */
export interface UrlObject {
  auth?: string | null
  hash?: string | null
  host?: string | null
  hostname?: string | null
  href?: string
  path?: string | null
  pathname?: string | null
  protocol?: string | null
  search?: string | null
  slashes?: boolean | null
  port?: string | number | null
  query?:
    | string
    | null
    | Record<
        string,
        | string
        | number
        | boolean
        | bigint
        | readonly (string | number | boolean | bigint)[]
        | null
        | undefined
      >
}

/**
 * Browser-compatible URL parsing (spec-compliant with Node.js url.parse)
 * @param urlStr - The URL string to parse
 * @param parseQueryString - If true, parse the query string into an object
 * @returns Parsed URL object
 */
function parseUrl(urlStr: string, parseQueryString = false): UrlObject {
  const result: UrlObject = {
    protocol: null,
    slashes: null,
    auth: null,
    host: null,
    port: null,
    hostname: null,
    hash: null,
    search: null,
    query: null,
    pathname: null,
    path: null,
    href: urlStr,
  }

  // Handle empty or invalid input
  if (!urlStr || typeof urlStr !== "string") {
    return result
  }

  let rest = urlStr.trim()

  // Extract hash
  const hashIndex = rest.indexOf("#")
  if (hashIndex !== -1) {
    result.hash = rest.slice(hashIndex)
    rest = rest.slice(0, hashIndex)
  }

  // Extract query string
  const queryIndex = rest.indexOf("?")
  if (queryIndex !== -1) {
    result.search = rest.slice(queryIndex)
    rest = rest.slice(0, queryIndex)

    if (parseQueryString && result.search) {
      const query: Record<string, string | string[]> = {}
      const searchParams = result.search.slice(1) // Remove leading '?'
      if (searchParams) {
        searchParams.split("&").forEach((param) => {
          const [key, ...valueParts] = param.split("=")
          if (key) {
            const decodedKey = decodeURIComponent(key)
            const decodedValue = valueParts.length ? decodeURIComponent(valueParts.join("=")) : ""
            const existing = query[decodedKey]
            if (existing !== undefined) {
              query[decodedKey] = Array.isArray(existing)
                ? [...existing, decodedValue]
                : [existing, decodedValue]
            } else {
              query[decodedKey] = decodedValue
            }
          }
        })
      }
      result.query = query
    }
  }

  // Check for protocol
  const protoMatch = /^([a-z][a-z0-9+.-]*):\/\//i.exec(rest)
  if (protoMatch) {
    const protocol = protoMatch[1]
    if (!protocol) {
      return result
    }
    result.protocol = `${protocol.toLowerCase()}:`
    result.slashes = true
    rest = rest.slice(protoMatch[0].length)

    // Extract auth (user:pass)
    const atIndex = rest.indexOf("@")
    const slashIndex = rest.indexOf("/")
    if (atIndex !== -1 && (slashIndex === -1 || atIndex < slashIndex)) {
      result.auth = rest.slice(0, atIndex)
      rest = rest.slice(atIndex + 1)
    }

    // Extract host (hostname:port)
    const hostEnd = rest.indexOf("/")
    const hostPart = hostEnd === -1 ? rest : rest.slice(0, hostEnd)
    if (hostPart) {
      result.host = hostPart
      const colonIndex = hostPart.lastIndexOf(":")
      if (colonIndex !== -1) {
        result.hostname = hostPart.slice(0, colonIndex)
        result.port = hostPart.slice(colonIndex + 1)
      } else {
        result.hostname = hostPart
      }
    }

    if (hostEnd !== -1) {
      rest = rest.slice(hostEnd)
    } else {
      rest = ""
    }
  }

  // Remaining is pathname
  if (rest) {
    result.pathname = rest
  }

  // Set path (pathname + search)
  if (result.pathname || result.search) {
    result.path = (result.pathname ?? "") + (result.search ?? "")
  }

  return result
}

/**
 * Browser-compatible URL formatting (spec-compliant with Node.js url.format)
 * @param urlObj - URL object to format
 * @returns Formatted URL string
 */
function formatUrl(urlObj: UrlObject): string {
  let result = ""

  // Protocol
  if (urlObj.protocol) {
    const normalizedProtocol = urlObj.protocol.endsWith(":")
      ? urlObj.protocol
      : `${urlObj.protocol}:`
    result += normalizedProtocol
    if (urlObj.slashes) {
      result += "//"
    }
  }

  // Auth
  if (urlObj.auth) {
    result += urlObj.auth + "@"
  }

  // Host or hostname:port
  if (urlObj.host) {
    result += urlObj.host
  } else if (urlObj.hostname) {
    result += urlObj.hostname
    if (urlObj.port) {
      result += ":" + urlObj.port
    }
  }

  // Pathname
  if (urlObj.pathname) {
    result += urlObj.pathname
  }

  // Search or query
  if (urlObj.query && typeof urlObj.query === "object") {
    const params: string[] = []
    for (const [key, value] of Object.entries(urlObj.query)) {
      if (value === null || value === undefined) {
        continue
      }
      const encodedKey = encodeURIComponent(key)
      if (Array.isArray(value)) {
        value.forEach((v) => {
          params.push(`${encodedKey}=${encodeURIComponent(String(v))}`)
        })
      } else {
        params.push(`${encodedKey}=${encodeURIComponent(String(value))}`)
      }
    }
    if (params.length > 0) {
      result += "?" + params.join("&")
    }
  } else if (urlObj.search) {
    result += urlObj.search.startsWith("?") ? urlObj.search : "?" + urlObj.search
  }

  // Hash
  if (urlObj.hash) {
    result += urlObj.hash.startsWith("#") ? urlObj.hash : "#" + urlObj.hash
  }

  return result
}

/**
 * Browser-compatible path resolution (similar to path.resolve)
 * Resolves a sequence of paths into an absolute path.
 */
function resolvePath(...paths: string[]): string {
  let resolvedPath = ""
  let resolvedAbsolute = false

  // Process paths from right to left until we find an absolute path
  for (let i = paths.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    const path = i >= 0 ? paths[i] : "/"

    // Skip empty paths
    if (!path || path.length === 0) {
      continue
    }

    resolvedPath = `${path}/${resolvedPath}`
    resolvedAbsolute = path.startsWith("/")
  }

  // Normalize the path
  resolvedPath = normalizePathSegments(resolvedPath, !resolvedAbsolute)

  if (resolvedAbsolute) {
    return `/${resolvedPath}`
  }
  return resolvedPath.length > 0 ? resolvedPath : "."
}

/**
 * Normalizes path segments by resolving . and .. components
 */
function normalizePathSegments(path: string, allowAboveRoot: boolean): string {
  let res = ""
  let lastSegmentLength = 0
  let lastSlash = -1
  let dots = 0
  let code = 0

  for (let i = 0; i <= path.length; ++i) {
    if (i < path.length) {
      code = path.charCodeAt(i)
    } else if (code === 47 /* / */) {
      break
    } else {
      code = 47 /* / */
    }

    if (code === 47 /* / */) {
      if (lastSlash === i - 1 || dots === 1) {
        // NOOP
      } else if (dots === 2) {
        if (
          res.length < 2 ||
          lastSegmentLength !== 2 ||
          res.charCodeAt(res.length - 1) !== 46 /* . */ ||
          res.charCodeAt(res.length - 2) !== 46 /* . */
        ) {
          if (res.length > 2) {
            const lastSlashIndex = res.lastIndexOf("/")
            if (lastSlashIndex === -1) {
              res = ""
              lastSegmentLength = 0
            } else {
              res = res.slice(0, lastSlashIndex)
              lastSegmentLength = res.length - 1 - res.lastIndexOf("/")
            }
            lastSlash = i
            dots = 0
            continue
          } else if (res.length !== 0) {
            res = ""
            lastSegmentLength = 0
            lastSlash = i
            dots = 0
            continue
          }
        }
        if (allowAboveRoot) {
          res += res.length > 0 ? "/.." : ".."
          lastSegmentLength = 2
        }
      } else {
        if (res.length > 0) {
          res += `/${path.slice(lastSlash + 1, i)}`
        } else {
          res = path.slice(lastSlash + 1, i)
        }
        lastSegmentLength = i - lastSlash - 1
      }
      lastSlash = i
      dots = 0
    } else if (code === 46 /* . */ && dots !== -1) {
      ++dots
    } else {
      dots = -1
    }
  }
  return res
}

export interface ResolveHrefOptions {
  currentPath?: string // The current path, useful for resolving relative Hrefs
  locale?: string // The current locale, for prefixing
  defaultLocale?: string // The default locale
  locales?: string[] // A list of all supported locales
  basePath?: string // The base path, if the app is deployed under a subpath
}

/**
 * A simplified standalone implementation of Next.js' `resolveHref`.
 * It resolves a given href into a complete URL, taking into account
 * query parameters, locales, and an optional base path.
 *
 * @param href The URL or URL object to resolve.
 * @param options Options for resolution, e.g., currentPath, locale, basePath.
 * @returns A string representing the fully resolved URL.
 */
export function resolveHref(href: string | UrlObject, options: ResolveHrefOptions = {}): string {
  const { currentPath = "/", locale, defaultLocale, locales, basePath } = options

  let parsedHref: UrlObject

  if (typeof href === "string") {
    parsedHref = parseUrl(href, true) // `true` to parse the query string into an object
  } else {
    parsedHref = { ...href }
  }

  // Resolve path relative to the current path, if `href` is a relative path
  if (parsedHref.pathname && !parsedHref.pathname.startsWith("/")) {
    const currentDirectory = currentPath.substring(0, currentPath.lastIndexOf("/"))
    parsedHref.pathname = resolvePath(currentDirectory, parsedHref.pathname)
  }

  // Merge query parameters (overwrite existing, add new)
  const normalizeQuery = (
    q: unknown,
  ): Record<
    string,
    | string
    | number
    | boolean
    | bigint
    | readonly (string | number | boolean | bigint)[]
    | null
    | undefined
  > => {
    // Return empty object if not a valid object
    if (!q || typeof q !== "object" || Array.isArray(q)) {
      return {}
    }

    const result: Record<
      string,
      | string
      | number
      | boolean
      | bigint
      | readonly (string | number | boolean | bigint)[]
      | null
      | undefined
    > = {}
    for (const [k, v] of Object.entries(q)) {
      if (
        typeof v === "string" ||
        typeof v === "number" ||
        typeof v === "boolean" ||
        typeof v === "bigint" ||
        v === null ||
        v === undefined
      ) {
        result[k] = v as string | number | boolean | bigint | null | undefined
      } else if (Array.isArray(v)) {
        const arr = v.filter(
          (item): item is string | number | boolean | bigint =>
            typeof item === "string" ||
            typeof item === "number" ||
            typeof item === "boolean" ||
            typeof item === "bigint",
        )
        result[k] = arr as readonly (string | number | boolean | bigint)[]
      } else {
        result[k] = String(v)
      }
    }
    return result
  }

  const baseQuery = normalizeQuery(parsedHref.query)
  const searchQueryRaw = parsedHref.search ? parseUrl(parsedHref.search, true).query : null
  const searchQuery = normalizeQuery(searchQueryRaw)
  const combinedQuery = {
    ...baseQuery,
    ...searchQuery,
  }
  parsedHref.query = combinedQuery
  parsedHref.search = undefined // Remove `search` as `query` is used

  // Locale prefixing
  if (locale && locales && locales.includes(locale) && locale !== defaultLocale) {
    // Avoid double locale prefixes if href already starts with the locale
    const localePrefix = `/${locale}`
    if (!parsedHref.pathname?.startsWith(localePrefix)) {
      parsedHref.pathname = `${localePrefix}${parsedHref.pathname === "/" ? "" : parsedHref.pathname}`
    }
  }

  // Add base path
  if (basePath) {
    // Remove leading/trailing slashes for clean concatenation
    const cleanedBasePath = basePath.endsWith("/") ? basePath.slice(0, -1) : basePath
    const cleanedPathname = parsedHref.pathname?.startsWith("/")
      ? parsedHref.pathname
      : `/${parsedHref.pathname ?? ""}`
    parsedHref.pathname = `${cleanedBasePath}${cleanedPathname}`
  }

  // Ensure the path always starts with a slash if it exists
  if (parsedHref.pathname && !parsedHref.pathname.startsWith("/")) {
    parsedHref.pathname = `/${parsedHref.pathname}`
  }

  // If only a fragment (`#anchor`) was provided
  if (!parsedHref.pathname && parsedHref.hash) {
    // If only a hash is present, we take the current path as base
    parsedHref.pathname = currentPath.split("#")[0]
  }

  return formatUrl(parsedHref)
}
