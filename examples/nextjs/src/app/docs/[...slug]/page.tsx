import { removeFromArray, transformedEntries } from "@pkgdocs/core"

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

  console.dir(staticPaths)
  return [{ slug: ["something"] }, { slug: ["some", "thing"] }]
}

export default async function Page(params: PageProps<"/docs/[...slug]">) {
  const { slug } = await params.params

  return <>Docs: {slug ? slug.join("/") : "index"}</>
}
