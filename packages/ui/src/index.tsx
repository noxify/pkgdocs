export type {
  DocConfig,
  FrameworkAdapter,
  FrameworkCapabilities,
  FrameworkComponents,
  FrameworkImageProps,
  FrameworkLinkProps,
  LayoutProps,
} from "./types"
export { ThemeProvider } from "./theme/ThemeProvider"
export type { ThemeProviderProps } from "./theme/ThemeProvider"
export { resolveLayout, layoutRegistry } from "./registry/layouts"
export { ClassicLayout } from "./layouts/classic"
export { MinimalLayout } from "./layouts/minimal"
export {
  FrameworkProvider,
  defaultFrameworkAdapter,
  resolveFrameworkAdapter,
  useFrameworkAdapter,
} from "./framework"
export { createMdxComponents } from "./mdx"
export type { CreateMdxOptions, MdxComponents } from "./mdx/types"
