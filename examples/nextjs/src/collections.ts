import { Collection, Directory } from "renoun"

import type { TreeItem } from "@pkgdocs/core"
import { directoryFilter, docSchema, getTree } from "@pkgdocs/core"

export const availableCollections = ["getting-started", "api", "tutorials"] as const

export type AvailableCollection = (typeof availableCollections)[number]

export function createDirectories() {
  return availableCollections.map((collection) => {
    return new Directory({
      basePathname: collection,
      path: `content/${collection}`,
      // repository: {
      //   host: "github",
      //   baseUrl: "https://github.com",
      //   owner: "noxify",
      //   repository: "pkgdocs",
      //   path: `examples/nextjs/content/${collection}`,
      // },
      schema: {
        mdx: docSchema,
      },
      loader: {
        mdx: (path) => {
          return import(`../content/${collection}/${path}.mdx`)
        },
      },
      filter: directoryFilter,
    })
  })
}

const DocsCollection = new Collection({
  entries: createDirectories(),
})

/**
 * Generate all static routes for the docs collection, including collection routes and individual entry routes.
 */
const staticRoutes = async () => {
  const collections = await DocsCollection.getEntries({
    recursive: false,
    includeIndexAndReadmeFiles: true,
  })

  const collectionPaths = await Promise.all(
    collections.map(async (collection) => {
      const collectionEntries = await collection.getEntries({
        recursive: true,
        includeIndexAndReadmeFiles: true,
      })

      return collectionEntries.map((entry) => entry.getPathnameSegments())
    }),
  )

  return collectionPaths.flat()
}

export interface LlmsTreeItem {
  title: string
  description: string | undefined
  docsHref: string
  rawHref: string
  isDirectory: boolean
  children: LlmsTreeItem[]
}

function toRawHref(slug: readonly string[]): string {
  if (slug.length === 0) {
    return "/raw"
  }

  const lastSegment = slug.at(-1)

  if (!lastSegment) {
    return "/raw"
  }

  const rawSlug = [...slug.slice(0, -1), `${lastSegment}.md`]

  return `/raw/${rawSlug.join("/")}`
}

function treeItemToLlms(item: TreeItem): LlmsTreeItem {
  const selfChild: LlmsTreeItem | undefined =
    !item.isFile && item.hasFile
      ? {
          title: item.title,
          description: item.description,
          docsHref: `/docs${item.path}`,
          rawHref: toRawHref(item.slug),
          isDirectory: false,
          children: [],
        }
      : undefined

  return {
    title: item.title,
    description: !item.isFile ? undefined : item.description,
    docsHref: `/docs${item.path}`,
    rawHref: item.isFile ? toRawHref(item.slug) : "",
    isDirectory: !item.isFile,
    children: [...(selfChild ? [selfChild] : []), ...(item.children ?? []).map(treeItemToLlms)],
  }
}

export async function getCollectionLlmsTree(
  collection: AvailableCollection,
): Promise<LlmsTreeItem[]> {
  const tree = await getTree(DocsCollection, collection)

  return tree.map(treeItemToLlms)
}

export { DocsCollection, staticRoutes }
