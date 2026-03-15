type PathInput = string | readonly string[]

function normalizePath(path: string): string {
  if (path === "/") {
    return path
  }

  return path.endsWith("/") ? path.slice(0, -1) : path
}

function toArray(input: PathInput): readonly string[] {
  return (Array.isArray(input) ? input : [input]) as readonly string[]
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function matchGlob(currentPath: string, checkPath: string): boolean {
  const normalizedCurrentPath = normalizePath(currentPath)
  const normalizedCheckPath = normalizePath(checkPath)

  if (normalizedCheckPath.includes("*")) {
    const regexPattern = `^${escapeRegex(normalizedCheckPath).replaceAll("\\*\\*", ".*").replaceAll("\\*", "[^/]*")}$`
    return new RegExp(regexPattern).test(normalizedCurrentPath)
  }

  return normalizedCurrentPath === normalizedCheckPath
}

export function isActive(currentPath: PathInput, checkPath: PathInput): boolean {
  const currentPaths = toArray(currentPath)
  const checkPaths = toArray(checkPath)

  return currentPaths.some((currentPathValue) =>
    checkPaths.some((checkPathValue) => matchGlob(currentPathValue, checkPathValue)),
  )
}
