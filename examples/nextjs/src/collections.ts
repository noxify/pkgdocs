import { Collection, Directory } from "renoun"

import { directoryFilter, docSchema } from "@pkgdocs/core"

const availableCollections = ["getting-started", "api", "tutorials"] as const

export type AvailableCollection = (typeof availableCollections)[number]

export function createDirectories() {
  return availableCollections.map((collection) => {
    return new Directory({
      basePathname: collection,
      path: `content/${collection}`,
      repository: {
        host: "github",
        baseUrl: "https://github.com",
        owner: "noxify",
        repository: "pkgdocs",
        path: `examples/nextjs/content/${collection}`,
      },
      schema: {
        mdx: docSchema,
      },
      loader: {
        mdx: (path) => import(`../content/${collection}/${path}.mdx`),
      },
      filter: directoryFilter,
    })
  })
}

const DocsCollection = new Collection({
  entries: createDirectories(),
})

export { DocsCollection }
