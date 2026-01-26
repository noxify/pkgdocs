import { notFound } from "next/navigation"
import { NextResponse } from "next/server"

import { getFileForEntry, removeFromArray, transformedEntries } from "@pkgdocs/core"

import { DocsCollection } from "~/collections"

export const dynamic = "force-static"

export async function generateStaticParams() {
  // Provide concrete paths for the dynamic catch-all param.
  // Do NOT include the parent segment ("docs") in the slug.

  const entries = await transformedEntries(DocsCollection)

  const staticPaths = entries
    // get all possible routes including the collection routes
    .map((entry) => {
      const slug = removeFromArray(entry.segments, ["docs"])
      if (slug.length === 0) return null
      // Always add .md extension to avoid conflicts with directories
      return {
        slug: [...slug.slice(0, -1), `${slug[slug.length - 1]}.md`],
      }
    })
    .filter((path) => path !== null)

  return staticPaths
}

export async function GET(req: Request, params: RouteContext<"/api/docs/[...slug]">) {
  const { slug } = await params.params

  // Check if the last segment has .md extension
  const lastSegment = slug[slug.length - 1] ?? ""
  const hasMdExtension = lastSegment.endsWith(".md")

  // Remove .md extension if present for file lookup
  const lookupSlug = hasMdExtension ? [...slug.slice(0, -1), lastSegment.replace(".md", "")] : slug

  const searchParam = `/${lookupSlug.join("/")}`

  const transformedEntry = (await transformedEntries(DocsCollection)).find(
    (ele) => ele.fullPathname == searchParam,
  )

  if (!transformedEntry) {
    notFound()
  }

  const file = await getFileForEntry(DocsCollection, transformedEntry)

  if (!file) {
    notFound()
  }

  const md = await file.getText()

  return new NextResponse(md, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
    },
  })
}
