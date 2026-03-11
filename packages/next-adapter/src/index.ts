import type { NextMDXOptions } from "@next/mdx"
import type { MDXComponents } from "mdx/types"
import createMdxPlugin from "@next/mdx"

import type { CreateMdxOptions } from "@pkgdocs/ui"
import { createMdxComponents } from "@pkgdocs/ui"

import type { NextAdapterOptions } from "./framework"
import { createNextFrameworkAdapter } from "./framework"

export type {
  NextAdapterOptions,
  NextFrameworkAdapter,
  FrameworkLinkProps,
  FrameworkImageProps,
} from "./framework"
export { createNextFrameworkAdapter } from "./framework"

export interface NextFrameworkConfig {
  prefetch?: boolean
  useOptimizedImage?: boolean
}

export interface CreateNextMdxOptions extends CreateMdxOptions {
  next?: NextAdapterOptions
}

export function nextAdapterOptionsFromFrameworkConfig(
  config?: NextFrameworkConfig,
): NextAdapterOptions {
  return {
    prefetch: config?.prefetch,
    useOptimizedImage: config?.useOptimizedImage,
  }
}

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

export function createNextMdxComponents(opts: CreateNextMdxOptions = {}): MDXComponents {
  const adapter = createNextFrameworkAdapter(opts.next)

  return createMdxComponents({
    ...opts,
    adapter,
  })
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
      providerImportSource: "renoun/mdx/components",
      remarkPlugins: [
        "remark-strip-badges",
        "@renoun/mdx/remark/transform-relative-links",
        "@renoun/mdx/remark/gfm",
        "@renoun/mdx/remark/transform-jsdoc-inline-tags",
        "@renoun/mdx/remark/remove-immediate-paragraphs",
        "remark-squeeze-paragraphs",
        //"@renoun/mdx/remark/add-frontmatter",
        "remark-frontmatter",
        "remark-mdx-frontmatter",
        "@renoun/mdx/remark/add-sections",
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
