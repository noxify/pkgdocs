"use client"

import type { PropsWithChildren } from "react"
import { createContext, useContext } from "react"

import type { FrameworkAdapter } from "../types"
import { defaultFrameworkAdapter, resolveFrameworkAdapter } from "./adapter"

const FrameworkContext = createContext<FrameworkAdapter>(defaultFrameworkAdapter)

export function FrameworkProvider({
  adapter,
  children,
}: PropsWithChildren<{ adapter?: FrameworkAdapter }>) {
  const value = resolveFrameworkAdapter(adapter)
  return <FrameworkContext.Provider value={value}>{children}</FrameworkContext.Provider>
}

export function useFrameworkAdapter(): FrameworkAdapter {
  return useContext(FrameworkContext)
}
