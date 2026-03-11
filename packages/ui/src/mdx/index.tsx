import type { CreateMdxOptions, MdxComponents } from "./types"
import { resolveFrameworkAdapter } from "../framework"
import { Callout } from "./components/Callout"
import { CodeBlock } from "./components/CodeBlock"

function defaults(): MdxComponents {
  return {
    a: (p) => <a {...p} />,
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
    adapterComponents.a = (p) => link(p)
  }

  if (adapter.components?.Image) {
    const image = adapter.components.Image
    adapterComponents.img = (p) => image(p)
  }

  return Object.assign({}, defaults(), adapterComponents, opts.overrides) as MdxComponents
}
