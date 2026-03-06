import type { Metadata } from "next"
import { RootProvider } from "renoun"

import { loadDocConfig } from "@pkgdocs/config"

import { ThemeProviderWrapper } from "~/components/ThemeProviderWrapper"

import "~/styles/globals.css"

const docConfig = await loadDocConfig()
const uiConfig = docConfig.ui ?? {}

export const metadata: Metadata = {
  title: "pkgdocs",
  description: "pkgdocs",
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <RootProvider {...docConfig.renoun}>
      <html lang="en" suppressHydrationWarning>
        <body>
          <ThemeProviderWrapper
            config={{
              layoutKey: docConfig.layout ?? uiConfig.layoutKey ?? "classic",
              options: uiConfig.options,
              theme: uiConfig.theme,
              features: uiConfig.features,
            }}
            theme={{
              attribute: "class",
              defaultTheme: docConfig.defaultTheme ?? "system",
              enableSystem: true,
              ...docConfig.betterThemes,
            }}
          >
            {children}
          </ThemeProviderWrapper>
        </body>
      </html>
    </RootProvider>
  )
}
