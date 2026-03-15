import fs from "node:fs"
import path from "node:path"
import process from "node:process"
import semver from "semver"

const workspaceRoot = process.cwd()
const packageJsonPath = path.join(workspaceRoot, "package.json")
const lockfilePath = path.join(workspaceRoot, "pnpm-lock.yaml")

const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"))
const lockfileContent = fs.readFileSync(lockfilePath, "utf8")
const overrides = packageJson?.pnpm?.overrides ?? {}

const overrideEntries = Object.entries(overrides)

if (overrideEntries.length === 0) {
  console.log("No pnpm overrides found in package.json")
  process.exit(0)
}

const parseOverrideSelector = (selector) => {
  if (!selector.includes("@")) {
    return {
      name: selector,
      range: null,
    }
  }

  if (!selector.startsWith("@")) {
    const firstAt = selector.indexOf("@")
    return {
      name: selector.slice(0, firstAt),
      range: selector.slice(firstAt + 1),
    }
  }

  const lastAt = selector.lastIndexOf("@")
  if (lastAt <= selector.indexOf("/")) {
    return {
      name: selector,
      range: null,
    }
  }

  return {
    name: selector.slice(0, lastAt),
    range: selector.slice(lastAt + 1),
  }
}

const findResolvedVersions = (packageName) => {
  const versions = new Set()
  const lines = lockfileContent.split("\n")

  for (const line of lines) {
    const entryMatch = line.match(/^ {2}'?(.+?)'?:\s*$/)
    if (!entryMatch) {
      continue
    }

    const entryKey = entryMatch[1]
    if (!entryKey.startsWith(`${packageName}@`)) {
      continue
    }

    const suffix = entryKey.slice(packageName.length + 1)
    const maybeVersion = suffix.split("(")[0]
    if (semver.valid(maybeVersion)) {
      versions.add(maybeVersion)
    }
  }

  return [...versions].sort(semver.compare)
}

const rows = overrideEntries.map(([selector, target]) => {
  const { name, range } = parseOverrideSelector(selector)
  const resolvedVersions = findResolvedVersions(name)

  const matchingVersions =
    range == null || range.length === 0
      ? resolvedVersions
      : resolvedVersions.filter((version) =>
          semver.satisfies(version, range, { includePrerelease: true }),
        )

  const status = matchingVersions.length > 0 ? "active" : "inactive"

  return {
    selector,
    target,
    packageName: name,
    range: range ?? "(none)",
    resolvedVersions,
    matchingVersions,
    status,
  }
})

const hasInactiveOverrides = rows.some((row) => row.status === "inactive")

for (const row of rows) {
  const resolved = row.resolvedVersions.length > 0 ? row.resolvedVersions.join(", ") : "none"
  const matching = row.matchingVersions.length > 0 ? row.matchingVersions.join(", ") : "none"

  console.log(`- ${row.status.toUpperCase()} ${row.selector} -> ${row.target}`)
  console.log(`  package: ${row.packageName}`)
  console.log(`  selector range: ${row.range}`)
  console.log(`  resolved versions: ${resolved}`)
  console.log(`  matching versions: ${matching}`)
}

if (process.argv.includes("--json")) {
  console.log(JSON.stringify(rows, null, 2))
}

if (process.argv.includes("--fail-unused") && hasInactiveOverrides) {
  process.exit(1)
}
