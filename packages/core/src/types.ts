import type { Collection, DefaultModuleTypes, Directory, FileSystemEntry } from "renoun/file-system"

import type { Frontmatter } from "./schema"

export type EntryType = FileSystemEntry
export type DirectoryType = Directory
export type { Frontmatter }

/**
 * Helper type for Collection with flexible generic constraints
 * Uses Record<string, unknown> to satisfy the InferModuleLoadersTypes constraint
 * while allowing any Collection type
 */
export type SourceCollection = Collection<DefaultModuleTypes>

export interface TransformedEntry {
  rawPathname: string
  pathname: string
  segments: string[]
  title: string
  path: string
  isDirectory: boolean
  sortOrder: number
  depth: number
  baseName: string
  siblings: (string | null)[]
  hasFile: boolean
}
