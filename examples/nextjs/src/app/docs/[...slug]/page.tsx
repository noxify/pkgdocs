import { Metadata } from "next"
import { notFound } from "next/navigation"

import {
  getBreadcrumbItems,
  getFileForEntry,
  removeFromArray,
  transformedEntries,
} from "@pkgdocs/core"

import { DocsCollection } from "~/collections"

export async function generateStaticParams() {
  // Provide concrete paths for the dynamic catch-all param.
  // Do NOT include the parent segment ("docs") in the slug.

  const entries = await transformedEntries(DocsCollection)

  const staticPaths = entries
    // get all possible routes including the collection routes
    .map((entry) => {
      return { slug: removeFromArray(entry.segments, ["docs"]) }
    })
    .filter(({ slug }) => slug.length > 0)

  return staticPaths
}

export async function generateMetadata(params: PageProps<"/docs/[...slug]">): Promise<Metadata> {
  const { slug } = await params.params

  const breadcrumbItems = await getBreadcrumbItems(DocsCollection, slug)

  const titles = breadcrumbItems.map((ele) => ele.title)

  return {
    title: `${titles.join(" - ")}`,
  }
}

export default async function Page(params: PageProps<"/docs/[...slug]">) {
  const { slug } = await params.params
  const searchParam = `/${slug.join("/")}`

  const transformedEntry = (await transformedEntries(DocsCollection)).find(
    (ele) => ele.fullPathname == searchParam,
  )

  if (!transformedEntry) {
    notFound()
  }

  const file = await getFileForEntry(DocsCollection, transformedEntry)

  const [Content] = await Promise.all([
    file?.getContent(),
    file?.getSections(),
    file?.getFrontmatter(),
  ])

  return <>{Content ? <Content /> : <div>No content</div>}</>
}
