import type { Metadata } from "next"
import type React from "react"
import { RootProvider } from "renoun/components"

import "~/styles/globals.css"

export const metadata: Metadata = {
  title: "pkgdocs",
  description: "pkgdocs",
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <RootProvider
      theme={{
        light: "vitesse-light",
        dark: "vitesse-dark",
      }}
      languages={["ts", "tsx", "mdx"]}
      git="noxify/pkgdocs"
    >
      <html lang="en" suppressHydrationWarning>
        <body>{children}</body>
      </html>
    </RootProvider>
  )
}
