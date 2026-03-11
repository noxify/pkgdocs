import type { NextMDXOptions } from "@next/mdx"
import type { MDXComponents } from "mdx/types"
import type { ImageProps } from "next/image"
import type { ComponentProps, ReactNode } from "react"
import { createElement } from "react"
import NextImage from "next/image"
import NextLink from "next/link"
import createMdxPlugin from "@next/mdx"

import type { CreateMdxOptions } from "@pkgdocs/ui"
import { createMdxComponents } from "@pkgdocs/ui"

export type FrameworkLinkProps = ComponentProps<"a">
export type FrameworkImageProps = ComponentProps<"img">

export interface NextFrameworkAdapter {
  components: {
    Link: (props: FrameworkLinkProps) => ReactNode
    Image: (props: FrameworkImageProps) => ReactNode
  }
  capabilities: {
    supportsPrefetch: boolean
    hasOptimizedImage: boolean
  }
}

export interface NextAdapterOptions {
  prefetch?: boolean
  useOptimizedImage?: boolean
}

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

const isExternalHref = (href: string): boolean => {
  return (
    href.startsWith("http://") ||
    href.startsWith("https://") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:")
  )
}

const createNextLinkComponent = (options: NextAdapterOptions) => (props: FrameworkLinkProps) => {
  const { href } = props
  const prefetch = options.prefetch ?? true

  if (typeof href !== "string") {
    return createElement("a", props)
  }

  if (href.startsWith("#") || isExternalHref(href)) {
    return createElement("a", props)
  }

  return createElement(NextLink, { ...props, href, prefetch })
}

const createNextImageComponent = (options: NextAdapterOptions) => (props: FrameworkImageProps) => {
  const useOptimizedImage = options.useOptimizedImage ?? true

  if (!useOptimizedImage) {
    return createElement("img", props)
  }

  const { alt, className, height, src, style, width } = props

  // Markdown images frequently omit dimensions; fall back to native img in that case.
  if (typeof src !== "string" || typeof width !== "number" || typeof height !== "number") {
    return createElement("img", props)
  }

  const nextImageProps: ImageProps = {
    src,
    alt: alt ?? "",
    width,
    height,
    className,
    style,
  }

  return createElement(NextImage, nextImageProps)
}

export function createNextFrameworkAdapter(options: NextAdapterOptions = {}): NextFrameworkAdapter {
  const prefetch = options.prefetch ?? true
  const useOptimizedImage = options.useOptimizedImage ?? true

  return {
    components: {
      Link: createNextLinkComponent(options),
      Image: createNextImageComponent(options),
    },
    capabilities: {
      supportsPrefetch: prefetch,
      hasOptimizedImage: useOptimizedImage,
    },
  }
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
