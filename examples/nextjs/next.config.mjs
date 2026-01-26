import createMdxPlugin from "@pkgdocs/mdx/nextjs"

const withMDX = createMdxPlugin()

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  reactStrictMode: true,
  trailingSlash: true,
  poweredByHeader: false,

  pageExtensions: ["js", "jsx", "ts", "tsx", "md", "mdx"],
  /** Enables hot reloading for local packages without a build step */
  transpilePackages: ["@pkgdocs/core"],
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },

  experimental: {
    /**
     * In case you have a lot of pages and experience failing builds,
     * you can enable these experimental feature to reduce the amount of used CPUs
     * this is helpful in CI environments with limited resources like GitHub Actions or Gitlab CI
     * by default Next.js uses all available CPUs which can lead to out-of-memory errors
     */
    //cpus: process.env.CI ? 4 : undefined,
    // Speed up compilation in dev mode
  },
}

const config = withMDX(nextConfig)

export default config
