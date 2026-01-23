import type { NextMDXOptions } from "@next/mdx"
import createMdxPlugin from "@next/mdx"

function mergeUnique<TItem>(base: readonly TItem[] = [], extra: readonly TItem[] = []): TItem[] {
  const seen = new Set<TItem>()
  const result: TItem[] = []
  for (const item of [...base, ...extra]) {
    if (!seen.has(item)) {
      seen.add(item)
      result.push(item)
    }
  }
  return result
}

export default function mdxPlugin(
  userOptions?: Partial<NextMDXOptions>,
  overrideDefault = false,
  arrayBehavior?: {
    replaceRemarkPlugins?: boolean
    replaceRehypePlugins?: boolean
  },
) {
  const defaultConfig: NextMDXOptions = {
    options: {
      remarkPlugins: [
        // generates section headings based on heading levels
        "@renoun/mdx/remark/add-sections",
        "@renoun/mdx/remark/add-frontmatter",
        "remark-strip-badges",
        "@renoun/mdx/remark/transform-relative-links",
        "@renoun/mdx/remark/gfm",
        "@renoun/mdx/remark/transform-jsdoc-inline-tags",
        "@renoun/mdx/remark/remove-immediate-paragraphs",
        "remark-squeeze-paragraphs",
      ],
      rehypePlugins: [
        "@renoun/mdx/rehype/add-code-block",
        "@renoun/mdx/rehype/add-reading-time",
        "rehype-mdx-import-media",
        "@renoun/mdx/rehype/unwrap-images",
      ],
    },
  }

  const resolved: NextMDXOptions = overrideDefault
    ? (userOptions ?? {})
    : {
        options: {
          ...(defaultConfig.options ?? {}),
          ...(userOptions?.options ?? {}),
          remarkPlugins: arrayBehavior?.replaceRemarkPlugins
            ? ((userOptions?.options?.remarkPlugins ??
                defaultConfig.options?.remarkPlugins ??
                []) as string[])
            : mergeUnique(
                (defaultConfig.options?.remarkPlugins ?? []) as string[],
                (userOptions?.options?.remarkPlugins ?? []) as string[],
              ),
          rehypePlugins: arrayBehavior?.replaceRehypePlugins
            ? ((userOptions?.options?.rehypePlugins ??
                defaultConfig.options?.rehypePlugins ??
                []) as string[])
            : mergeUnique(
                (defaultConfig.options?.rehypePlugins ?? []) as string[],
                (userOptions?.options?.rehypePlugins ?? []) as string[],
              ),
        },
      }

  return createMdxPlugin(resolved)
}
