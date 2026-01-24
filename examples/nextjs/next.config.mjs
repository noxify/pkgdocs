import createMDXPlugin from "@pkgdocs/mdx/nextjs"

const withMDX = createMDXPlugin()

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  reactStrictMode: true,
  trailingSlash: true,
  poweredByHeader: false,
  transpilePackages: ["@pkgdocs/core", "@pkgdocs/mdx"],
  pageExtensions: ["js", "jsx", "ts", "tsx", "md", "mdx"],
  /** Enables hot reloading for local packages without a build step */

  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },

  experimental: {
    /**
     * In case you have a lot of pages and experience failing builds,
     * you can enable these experimental features to reduce the amount of used CPUs
     * this is helpful in CI environments with limited resources like GitHub Actions or Gitlab CI
     * by default Next.js uses all available CPUs which can lead to out-of-memory errors
     */
    //cpus: process.env.CI ? 4 : undefined,
    // Speed up compilation in dev mode
    optimizePackageImports: ["renoun", "renoun/file-system"],
  },
}

export default withMDX(nextConfig)
