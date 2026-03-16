import type { MDXComponents } from "mdx/types"

import type { NextAdapterOptions } from "@pkgdocs/next-adapter"
import {
  createNextFrameworkAdapter,
  createNextMdxComponents,
  nextAdapterOptionsFromFrameworkConfig,
} from "@pkgdocs/next-adapter"

import docConfig from "../../pkgdocs.config.mjs"

const configAdapterOptions = nextAdapterOptionsFromFrameworkConfig(docConfig.framework)

export function resolveNextAdapterOptions(overrides: NextAdapterOptions = {}): NextAdapterOptions {
  return {
    prefetch: overrides.prefetch ?? configAdapterOptions.prefetch ?? true,
    useOptimizedImage:
      overrides.useOptimizedImage ?? configAdapterOptions.useOptimizedImage ?? true,
  }
}

export const nextAdapterOptions: NextAdapterOptions = resolveNextAdapterOptions()

export function getNextFrameworkAdapter(overrides: NextAdapterOptions = {}) {
  return createNextFrameworkAdapter(resolveNextAdapterOptions(overrides))
}

export const nextFrameworkAdapter = getNextFrameworkAdapter()

export function getNextMdxComponents(overrides: NextAdapterOptions = {}): MDXComponents {
  return createNextMdxComponents(resolveNextAdapterOptions(overrides))
}

export const nextMdxComponents: MDXComponents = getNextMdxComponents()
