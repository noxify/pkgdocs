import type { Metadata } from "next"
import type React from "react"

import "./globals.css"


export const metadata: Metadata = {
  title: "pkgdocs",
  description:
    "pkgdocs",
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
      <html lang="en" suppressHydrationWarning>
        <body>
          
            {children}
        </body>
      </html>
  )
}
