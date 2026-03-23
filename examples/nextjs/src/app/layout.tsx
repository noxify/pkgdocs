import type { Metadata } from "next"
import { RootProvider } from "renoun/components/RootProvider"

import { loadDocConfig } from "@pkgdocs/config"

import { FrameworkProviderWrapper } from "~/components/FrameworkProviderWrapper"
import { ThemeProviderWrapper } from "~/components/ThemeProviderWrapper"

import "~/styles/globals.css"

const docConfig = await loadDocConfig()

export const metadata: Metadata = {
  title: "pkgdocs",
  description: "pkgdocs",
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <RootProvider {...docConfig.renoun}>
      <html lang="en" suppressHydrationWarning>
        <body>
          <FrameworkProviderWrapper frameworkOptions={docConfig.framework}>
            <ThemeProviderWrapper config={docConfig}>{children}</ThemeProviderWrapper>
          </FrameworkProviderWrapper>
        </body>
      </html>
    </RootProvider>
  )
}
