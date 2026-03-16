"use client"

import type { PropsWithChildren } from "react"

import type { NextAdapterOptions } from "@pkgdocs/next-adapter"
import { createNextFrameworkAdapter } from "@pkgdocs/next-adapter/framework"
import { FrameworkProvider } from "@pkgdocs/ui/framework"

interface FrameworkProviderWrapperProps extends PropsWithChildren {
  frameworkOptions?: NextAdapterOptions
}

export function FrameworkProviderWrapper({
  children,
  frameworkOptions,
}: FrameworkProviderWrapperProps) {
  const adapter = createNextFrameworkAdapter(frameworkOptions)

  return <FrameworkProvider adapter={adapter}>{children}</FrameworkProvider>
}
