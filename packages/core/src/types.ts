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

/**
 * Transformed entry representing a standardized documentation entry.
 * Created by the getEntry function to provide a serializable format.
 */
export interface TransformedEntry {
  /** The root collection name this entry belongs to (e.g., "getting-started", "api") */
  group: string
  /** Full pathname including base pathname (e.g., "/getting-started/installation") */
  fullPathname: string
  /** Relative pathname without base pathname (e.g., "installation") */
  relativePathname: string
  /** Array of path segments including base pathname (e.g., ["getting-started", "installation"]) */
  segments: string[]
  /** Display title resolved from frontmatter or entry name */
  title: string
  /** Absolute file system path */
  path: string
  /** Whether this entry is a directory */
  isDirectory: boolean
  /** Sort order from file metadata, defaults to 0 */
  sortOrder: number
  /** Depth level in the directory tree (-1 for root collections) */
  depth: number
  /** Base name of the entry (filename or directory name) */
  baseName: string
  /** Whether this entry has an associated MDX file */
  hasFile: boolean
}
