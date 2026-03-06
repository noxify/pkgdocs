import { Collection, Directory } from "renoun"

import { directoryFilter, docSchema } from "@pkgdocs/core"

const availableCollections = ["getting-started", "api", "tutorials"] as const

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

export { DocsCollection, staticRoutes }
