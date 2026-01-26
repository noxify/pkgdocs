import { copyFile, mkdir, rm } from "node:fs/promises"
import { dirname, join } from "node:path"
import type { NextAdapter } from "next"

const adapter: NextAdapter = {
  name: "md-copy-adapter",

  async modifyConfig(config, { phase }) {
    // Modify the Next.js config based on the build phase
    if (phase === "phase-production-build") {
      return {
        ...config,
        // Add your modifications
      }
    }
    return config
  },

  async onBuildComplete({ outputs, projectDir }) {
    const startTime = performance.now()

    const apiRoutes = outputs.staticFiles.filter((route) => route.pathname.startsWith("/api/docs/"))

    for (const route of apiRoutes) {
      // Transform pathname: /api/docs/tutorials/quickstart.md -> /docs/tutorials/quickstart.md
      const newPathname = route.pathname.replace("/api/docs/", "/docs/")
      const newFilePath = join(projectDir, "out", newPathname)

      // Create directory if it doesn't exist
      await mkdir(dirname(newFilePath), { recursive: true })

      // Copy file
      await copyFile(route.filePath, newFilePath)
    }
    await rm(join(projectDir, "out", "api"), { recursive: true, force: true })

    const duration = performance.now() - startTime
    console.log(
      `✓ Copied ${apiRoutes.length} markdown files from /api/docs to /docs in ${duration.toFixed(1)}ms`,
    )
  },
}

export default adapter
