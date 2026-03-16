import { notFound } from "next/navigation"

import type { AvailableCollection, LlmsTreeItem } from "~/collections"
import { availableCollections, getCollectionLlmsTree } from "~/collections"
import { textResponse } from "~/shared/doc-paths"

export const dynamic = "force-static"

function normalizeCollectionName(collectionName: string): AvailableCollection | undefined {
  if (!collectionName.endsWith(".txt")) {
    return undefined
  }

  const collection = collectionName.slice(0, -4)

  if (collection.length === 0) {
    return undefined
  }

  return availableCollections.includes(collection as AvailableCollection)
    ? (collection as AvailableCollection)
    : undefined
}

function renderLlmsTree(items: LlmsTreeItem[], baseUrl: string, depth = 0): string {
  const indent = "  ".repeat(depth)

  return items
    .map((item) => {
      const descriptionPart =
        item.description !== undefined ? `: ${item.description}` : ": undefined"

      const line = item.isDirectory
        ? `${indent}- ${item.title}${descriptionPart}`
        : `${indent}- [${item.title}](${baseUrl}${item.docsHref})${descriptionPart}`

      const children =
        item.children.length > 0 ? "\n" + renderLlmsTree(item.children, baseUrl, depth + 1) : ""

      return line + children
    })
    .join("\n")
}

export async function generateStaticParams(): Promise<Array<{ collectionName: string }>> {
  return availableCollections.map((collection) => ({ collectionName: `${collection}.txt` }))
}

export async function GET(
  _request: Request,
  ctx: RouteContext<"/llms/[collectionName]">,
): Promise<Response> {
  const { collectionName } = await ctx.params
  const collection = normalizeCollectionName(collectionName)

  if (!collection) {
    notFound()
  }

  const tree = await getCollectionLlmsTree(collection)

  if (tree.length === 0) {
    notFound()
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? ""

  const body = [`# ${collection}`, "", renderLlmsTree(tree, baseUrl)].join("\n")

  return textResponse(body)
}
