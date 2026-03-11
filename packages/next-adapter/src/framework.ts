import type { ImageProps } from "next/image"
import type { ComponentProps, ReactNode } from "react"
import { createElement } from "react"
import NextImage from "next/image"
import NextLink from "next/link"

export type FrameworkLinkProps = ComponentProps<"a"> & {
  prefetch?: boolean
}
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

const isExternalHref = (href: string): boolean => {
  return (
    href.startsWith("http://") ||
    href.startsWith("https://") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:")
  )
}

const createNextLinkComponent = (options: NextAdapterOptions) => (props: FrameworkLinkProps) => {
  const { href, prefetch: prefetchOverride, ...anchorProps } = props
  const prefetch = prefetchOverride ?? options.prefetch ?? true

  if (typeof href !== "string") {
    return createElement("a", anchorProps)
  }

  if (href.startsWith("#") || isExternalHref(href)) {
    return createElement("a", { ...anchorProps, href })
  }

  return createElement(NextLink, { ...anchorProps, href, prefetch })
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
