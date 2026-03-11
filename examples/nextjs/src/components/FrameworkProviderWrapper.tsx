"use client"

import type { PropsWithChildren } from "react"

import { createNextFrameworkAdapter } from "@pkgdocs/next-adapter/framework"
import { FrameworkProvider } from "@pkgdocs/ui/framework"

export function FrameworkProviderWrapper({ children }: PropsWithChildren) {
  const adapter = createNextFrameworkAdapter()

  return <FrameworkProvider adapter={adapter}>{children}</FrameworkProvider>
}
