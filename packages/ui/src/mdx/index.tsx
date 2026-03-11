import type { FrameworkImageProps, FrameworkLinkProps } from "../types"
import type { CreateMdxOptions, MdxComponents } from "./types"
import { resolveFrameworkAdapter } from "../framework/adapter"
import { Callout } from "./components/Callout"
import { CodeBlock } from "./components/CodeBlock"

function defaults(): MdxComponents {
  return {
    a: (p) => {
      const { prefetch: _prefetch, ...anchorProps } = p as FrameworkLinkProps
      return <a {...anchorProps} />
    },
    pre: (p) => <pre {...p} />,
    code: (p) => <code {...p} />,
    img: (p) => <img {...p} />,
    h1: (p) => <h1 {...p} />,
    h2: (p) => <h2 {...p} />,
    Callout,
    CodeBlock,
  }
}

export function createMdxComponents(opts: CreateMdxOptions = {}): MdxComponents {
  const adapter = resolveFrameworkAdapter(opts.adapter)
  const adapterComponents: Partial<MdxComponents> = {}

  if (adapter.components?.Link) {
    const link = adapter.components.Link
    const linkComponent: NonNullable<MdxComponents["a"]> = (p: FrameworkLinkProps) => link(p)
    adapterComponents.a = linkComponent
  }

  if (adapter.components?.Image) {
    const image = adapter.components.Image
    const imageComponent: NonNullable<MdxComponents["img"]> = (p: FrameworkImageProps) => image(p)
    adapterComponents.img = imageComponent
  }

  return Object.assign({}, defaults(), adapterComponents, opts.overrides) as MdxComponents
}

export type { CreateMdxOptions, MdxComponents } from "./types"
