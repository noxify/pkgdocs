import { dirname, join } from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"
import { Collection, Directory } from "renoun/file-system"

import type { DirectoryType, SourceCollection } from "~/types"
import { directoryFilter } from "~/helpers"
import { docSchema } from "~/schema"

const sources = ["getting-started", "api"]
const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..")
const contentRoot = packageRoot

export function createSourceCollection(): SourceCollection {
  const collection = new Collection({
    entries: generateDirectories(),
  })

  return collection
}

export function generateDirectories(): DirectoryType[] {
  const directories = sources.map((source) => {
    return new Directory({
      path: join(contentRoot, "fixtures/content/", source),
      // basePathname: source,
      // repository: {
      //   host: "github",
      //   baseUrl: "https://github.com",
      //   owner: "noxify",
      //   repository: "pkgdocs",
      //   path: `content/${source}`,
      // },
      schema: {
        mdx: docSchema,
      },
      loader: {
        mdx: (path) => {
          const absoluteFilePath = join(contentRoot, "fixtures", "content", source, `${path}.mdx`)
          return import(pathToFileURL(absoluteFilePath).href)
        },
      },
      // hide hidden files ( starts with `_` ) and all asset directories ( `_assets` )
      // exclude also files which starts with a dot ( `.` ), which is needed for our datasources content
      filter: directoryFilter,
    })
  })

  return directories
}
