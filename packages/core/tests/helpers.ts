import type { DefaultModuleTypes, Directory as DirectoryType } from "renoun"
import dedent from "dedent"
import { Collection, Directory, InMemoryFileSystem } from "renoun"

import { directoryFilter } from "~/helpers"

const sources = ["getting-started", "api"]

const fileSystem = new InMemoryFileSystem({
  [`content/getting-started/index.mdx`]: dedent`
    ---
    title: Getting Started
    description: Get started with our documentation
    ---

    # Getting Started

    Welcome to the documentation.
  `,
  [`content/getting-started/installation.mdx`]: dedent`
    ---
    title: Installation
    description: How to install
    ---

    # Installation

    Install the package.
  `,
  [`content/api/index.mdx`]: dedent`
    ---
    title: API Reference
    description: API documentation
    entrypoint: /docs/api/overview
    ---

    # API Reference
  `,
  [`content/api/endpoints.mdx`]: dedent`
    ---
    title: Endpoints
    ---

    # Endpoints
  `,
  [`content/api/_private.mdx`]: dedent`
    ---
    title: Private
    ---

    # Private Section
  `,
  [`content/getting-started/external-link.mdx`]: dedent`
    ---
    title: External Resource
    externalLink: https://example.com
    ---

    # External
  `,
})

export function createSourceCollection(): Collection<DefaultModuleTypes> {
  return new Collection({
    entries: generateDirectories(),
  })
}

export function generateDirectories(): DirectoryType[] {
  return sources.map((source) => {
    return new Directory({
      path: `content/${source}`,
      fileSystem,
      basePathname: source,
      repository: {
        host: "github",
        baseUrl: "https://github.com",
        owner: "noxify",
        repository: "pkgdocs",
        path: `content/${source}`,
      },
      // hide hidden files ( starts with `_` ) and all asset directories ( `_assets` )
      // exclude also files which starts with a dot ( `.` ), which is needed for our datasources content
      filter: directoryFilter,
    })
  })
}
