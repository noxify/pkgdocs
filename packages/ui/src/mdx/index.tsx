import type { CreateMdxOptions, MdxComponents } from "./types"
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
  return { ...defaults(), ...(opts.overrides ?? {}) }
}
