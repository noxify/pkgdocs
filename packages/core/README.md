# @pkgdocs/core

Core utilities for building documentation sites with renoun file-system collections.

## Features

- 🚀 **Type-safe** - Full TypeScript support with comprehensive type definitions
- 📦 **Caching** - Smart caching with React Server Components support
- 🔍 **Collections** - Transform and query file-system collections
- 🎯 **Metadata** - Extract and process frontmatter metadata
- 🔗 **Navigation** - Built-in sibling navigation and breadcrumb support

## Installation

```bash
pnpm add @pkgdocs/core renoun
```

## Quick Start

```typescript
import { Collection, Directory } from "renoun"

import { getSiblings, transformedEntries } from "@pkgdocs/core"

// Create a collection
const collection = new Collection({
  entries: [
    new Directory({
      path: "content/docs",
      basePathname: "docs",
    }),
  ],
})

// Get all transformed entries
const entries = await transformedEntries(collection)

// Get navigation siblings
const [prev, next] = await getSiblings(collection, entries[0])
```

## API Reference

### Collections

#### `rootCollections(sourceCollection)`

Retrieves all top-level collections with their metadata.

```typescript
const roots = await rootCollections(collection)
// [{ title: "Getting Started", entrypoint: "/getting-started", description: "", group: "getting-started" }]
```

#### `transformedEntries(sourceCollection, group?)`

Flattens and transforms all entries from collections into a serializable format.

```typescript
// Get all entries
const allEntries = await transformedEntries(collection)

// Get entries for specific group
const apiEntries = await transformedEntries(collection, "api")
```

#### `getEntry(sourceCollection, source)`

Transforms a single FileSystemEntry into a standardized format.

```typescript
const entry = await getEntry(collection, rawEntry)
// {
//   group: "getting-started",
//   fullPathname: "/getting-started/installation",
//   relativePathname: "installation",
//   segments: ["getting-started", "installation"],
//   title: "Installation",
//   isDirectory: false,
//   hasFile: true,
//   ...
// }
```

#### `getSiblings(sourceCollection, entry)`

Gets the previous and next entries relative to the current entry, filtering out hidden and external entries.

```typescript
const [prev, next] = await getSiblings(collection, currentEntry)

if (prev) {
  console.log("Previous:", prev.title)
}

if (next) {
  console.log("Next:", next.title)
}
```

#### `getBreadcrumbItems(sourceCollection, slug, allEntries?)`

Generates breadcrumb navigation items from a slug array.

```typescript
const breadcrumbs = await getBreadcrumbItems(collection, ["getting-started", "installation"])
// [
//   { title: "Getting Started", path: ["getting-started"] },
//   { title: "Installation", path: ["getting-started", "installation"] }
// ]
```

#### `getChildEntries(sourceCollection, source)`

Gets all immediate child entries for a directory or index file.

```typescript
const children = await getChildEntries(collection, parentEntry)
```

### Metadata

#### `getMetadata(file)`

Extracts frontmatter metadata from an MDX file.

```typescript
const file = await getFileContent(collection, entry)
const metadata = await getMetadata(file)
// { title: "Installation", description: "How to install", ... }
```

#### `getFileContent(sourceCollection, source)`

Gets the file content for an entry, checking segment file, index file, and readme file in order.

```typescript
const file = await getFileContent(collection, entry)
```

### Helpers

#### `getTitle(entry, frontmatter?, includeTitle?)`

Resolves the appropriate title for display in navigation.

```typescript
const title = getTitle(entry, frontmatter, true)
// Priority: navTitle > title (if includeTitle) > entry.title
```

#### `isHidden(entry)`

Checks if an entry should be hidden (starts with underscore).

```typescript
if (isHidden(entry)) {
  // Skip hidden entry
}
```

#### `directoryFilter(entry)`

Filter function for excluding hidden files and asset directories.

```typescript
const directory = new Directory({
  path: "content",
  filter: directoryFilter,
})
```

## Types

### `TransformedEntry`

```typescript
interface TransformedEntry {
  /** The root collection name this entry belongs to */
  group: string
  /** Full pathname including base pathname */
  fullPathname: string
  /** Relative pathname without base pathname */
  relativePathname: string
  /** Array of path segments */
  segments: string[]
  /** Display title */
  title: string
  /** Absolute file system path */
  path: string
  /** Whether this entry is a directory */
  isDirectory: boolean
  /** Sort order from file metadata */
  sortOrder: number
  /** Depth level in the directory tree */
  depth: number
  /** Base name of the entry */
  baseName: string
  /** Whether this entry has an associated MDX file */
  hasFile: boolean
}
```

### `Frontmatter`

```typescript
interface Frontmatter {
  title?: string
  navTitle?: string
  description?: string
  group?: string
  entrypoint?: string
  externalLink?: string
}
```

## Caching

The package includes smart caching that works with React Server Components:

- **Production/Development**: Uses React's `cache()` function for request-scoped caching
- **Tests**: Falls back to Map-based caching for Node.js environments

```typescript
import { cacheWithKey, optionalCache } from "@pkgdocs/core/cache"

// Simple function caching
const cached = optionalCache((arg: string) => expensiveOperation(arg))

// Custom key-based caching
const cachedWithKey = cacheWithKey(
  (arg: string) => expensiveOperation(arg),
  (arg) => `custom-key:${arg}`,
)
```

## Directory Structure Convention

```
content/
  getting-started/         # Collection group
    index.mdx             # Group index page
    installation.mdx      # Entry
    _private.mdx          # Hidden (starts with _)
    _assets/              # Filtered out
      image.png
  api/                    # Another collection group
    index.mdx
    endpoints.mdx
```

## License

MIT
