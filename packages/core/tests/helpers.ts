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
  [`content/getting-started/01.installation.mdx`]: dedent`
    ---
    title: Installation
    description: How to install
    ---

    # Installation

    Install the package.
  `,
  [`content/getting-started/02.setup/index.mdx`]: dedent`
    ---
    title: Setup
    description: Setup instructions
    ---

    # Setup

    Get your environment set up for development.
  `,
  [`content/getting-started/02.setup/01.prerequisites.mdx`]: dedent`
    ---
    title: Prerequisites
    description: Required tools and knowledge
    ---

    # Prerequisites

    Before getting started, make sure you have the following installed.
  `,
  [`content/getting-started/02.setup/02.configuration.mdx`]: dedent`
    ---
    title: Configuration
    description: How to configure
    ---

    # Configuration

    Configure your project.
  `,
  [`content/getting-started/03.guides/01.first-steps.mdx`]: dedent`
    ---
    title: First Steps
    description: Your first steps
    ---

    # First Steps

    Take your first steps with our library.
  `,
  [`content/getting-started/03.guides/02.advanced-usage.mdx`]: dedent`
    ---
    title: Advanced Usage
    description: Advanced patterns and techniques
    ---

    # Advanced Usage

    Learn advanced patterns.
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
