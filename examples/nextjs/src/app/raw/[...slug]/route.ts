import { notFound } from "next/navigation"
import { NextRequest } from "next/server"

import { getFileForEntry, transformedEntries } from "@pkgdocs/core"

import { DocsCollection } from "~/collections"
import { getRawRouteParams, normalizeRawSlugParts } from "~/shared/doc-paths"

export const dynamic = "force-static"

export async function generateStaticParams() {
  return getRawRouteParams()
}

export async function GET(_req: NextRequest, ctx: RouteContext<"/raw/[...slug]">) {
  const { slug } = await ctx.params
  const normalizedSlug = normalizeRawSlugParts(slug)
  const searchParam = `/${normalizedSlug.join("/")}`

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

  return new Response(md, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
    },
  })
}
