import { join } from "node:path"
import { Collection, Directory } from "renoun"

import { directoryFilter } from "~/helpers"
import { docSchema } from "~/schema"

const sources = ["getting-started", "api"]
const contentRoot = join(process.cwd(), "packages/core")

export function createSourceCollection() {
  const collection = new Collection({
    entries: generateDirectories(),
  })

  return collection
}

export function generateDirectories() {
  return sources.map((source) => {
    return new Directory({
      path: join(contentRoot, "fixtures/content/", source),
      basePathname: source,
      repository: {
        host: "github",
        baseUrl: "https://github.com",
        owner: "noxify",
        repository: "pkgdocs",
        path: `content/${source}`,
      },
      schema: {
        mdx: docSchema,
      },
      loader: {
        mdx: (path) => import(`#fixtures/content/${source}/${path}.mdx`),
      },
      // hide hidden files ( starts with `_` ) and all asset directories ( `_assets` )
      // exclude also files which starts with a dot ( `.` ), which is needed for our datasources content
      filter: directoryFilter,
    })
  })
}
