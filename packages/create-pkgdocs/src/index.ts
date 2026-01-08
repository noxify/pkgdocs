#!/usr/bin/env node
/* eslint-disable no-console */
import { existsSync, mkdirSync, writeFileSync } from "fs"
import { resolve } from "path"
// import { installPackage } from "@antfu/install-pkg"
import { cancel, confirm, intro, isCancel, outro, select, spinner, text } from "@clack/prompts"
// import { downloadTemplate as download } from "giget"
import pc from "picocolors"
import { readPackage } from "read-pkg"
import terminalLink from "terminal-link"

interface NpmPackageData {
  version: string
}

async function getLatestVersion(packageName: string): Promise<string> {
  try {
    const response = await fetch(`https://registry.npmjs.org/${packageName}/latest`)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const data = (await response.json()) as NpmPackageData
    return `^${data.version}`
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    console.warn(pc.yellow(`⚠️  Could not fetch latest version for ${packageName}, using '*'`))
    return "*"
  }
}

async function _updatePackageJson(targetDir: string, projectName: string): Promise<void> {
  const s = spinner()
  s.start("Updating package.json...")

  try {
    if (!existsSync(targetDir)) {
      s.stop("Target directory not found")
      return
    }

    const packageJson = await readPackage({ cwd: targetDir })

    // Update project name
    const updatedPackageJson = {
      ...packageJson,
      name: projectName,
    }

    // Get latest versions
    const [coreVersion] = await Promise.all([getLatestVersion("@pkgdocs/core")])

    // Replace workspace dependencies
    if (updatedPackageJson.dependencies) {
      if (updatedPackageJson.dependencies["@pkgdocs/core"]) {
        updatedPackageJson.dependencies["@pkgdocs/core"] = coreVersion
      }
    }

    // Remove workspace-specific fields
    delete updatedPackageJson.private

    writeFileSync(resolve(targetDir, "package.json"), JSON.stringify(updatedPackageJson, null, 2))
    s.stop("Package.json updated!")
  } catch (error) {
    s.stop("Failed to update package.json")
    throw error
  }
}

async function main() {
  // Parse CLI arguments
  const args = process.argv.slice(2)
  let projectName = args.find((arg) => !arg.startsWith("-"))
  const pmFlag = args.find((arg) => arg.startsWith("--package-manager=") || arg.startsWith("-pm="))
  const templateFlag = args.find((arg) => arg.startsWith("--template=") || arg.startsWith("-t="))
  const quietMode = args.includes("--quiet") || args.includes("-q")
  const noInstall = args.includes("--no-install")
  const cliPackageManager = pmFlag?.split("=")[1]
  const cliTemplate = templateFlag?.split("=")[1]

  // Override console methods in quiet mode
  if (quietMode) {
    console.clear = () => null
    console.log = () => null
    console.warn = () => null
  }

  if (!quietMode) {
    console.clear()
    intro(pc.bgCyan(pc.black(" create-pkgdocs ")))
  }

  if (!projectName) {
    const result = await text({
      message: "What is your project name?",
      placeholder: "my-app",
      validate: (value) => {
        if (!value) return "Project name is required"
        if (!/^[a-z0-9-_]+$/.test(value))
          return "Project name must contain only lowercase letters, numbers, hyphens, and underscores"
        return undefined
      },
    })

    if (isCancel(result)) {
      cancel("Operation cancelled")
      return process.exit(0)
    }

    projectName = result
  } else {
    // Validate CLI argument
    if (!/^[a-z0-9-_]+$/.test(projectName)) {
      cancel("Project name must contain only lowercase letters, numbers, hyphens, and underscores")
      return process.exit(1)
    }
  }

  // Skip dependency prompt if all CLI args provided (full automation) or --no-install flag
  let installDeps = !noInstall
  if (!noInstall && (!cliTemplate || !cliPackageManager)) {
    const result = await confirm({
      message: "Install dependencies?",
      initialValue: true,
    })

    if (isCancel(result)) {
      cancel("Operation cancelled")
      return process.exit(0)
    }

    installDeps = result
  }

  let packageManager = "npm"
  if (installDeps) {
    if (cliPackageManager) {
      // Validate CLI package manager
      const validManagers = ["npm", "pnpm", "yarn", "bun"]
      if (validManagers.includes(cliPackageManager)) {
        packageManager = cliPackageManager
      } else {
        cancel(
          `Invalid package manager: ${cliPackageManager}. Valid options: ${validManagers.join(", ")}`,
        )
        return process.exit(1)
      }
    } else {
      const result = await select({
        message: "Which package manager?",
        options: [
          { value: "npm", label: "npm" },
          { value: "pnpm", label: "pnpm" },
          { value: "yarn", label: "yarn" },
        ],
      })

      if (isCancel(result)) {
        cancel("Operation cancelled")
        return process.exit(0)
      }

      packageManager = result as string
    }
  }

  // Create project directory
  const targetDir = resolve(projectName)

  if (existsSync(targetDir)) {
    cancel(`Directory ${projectName} already exists`)
    return process.exit(1)
  }

  mkdirSync(targetDir, { recursive: true })

  try {
    // // Update package.json
    // await updatePackageJson(targetDir, projectName)

    // // Install dependencies
    // if (installDeps) {
    //   const s = spinner()
    //   s.start(`Installing dependencies with ${packageManager}...`)

    //   try {
    //     await installPackage([], {
    //       cwd: targetDir,
    //       silent: true,
    //       packageManager: packageManager,
    //     })
    //     s.stop("Dependencies installed!")
    //     // eslint-disable-next-line @typescript-eslint/no-unused-vars
    //   } catch (error) {
    //     s.stop("Failed to install dependencies")
    //     console.log(pc.yellow("You can install them manually with:"))
    //     console.log(pc.cyan(`  cd ${projectName}`))
    //     console.log(pc.cyan(`  ${packageManager} install`))
    //   }
    // }

    // Success message
    if (!quietMode) {
      outro(pc.green("🎉 Project created successfully!"))

      console.log()
      console.log("Next steps:")
      console.log(pc.cyan(`  cd ${projectName}`))
      if (!installDeps) {
        console.log(pc.cyan(`  ${packageManager} install`))
      }
      console.log(pc.cyan(`  ${packageManager} run dev`))
      console.log()
      console.log("Learn more:")
      console.log(`  ${terminalLink("Documentation", "https://pkgdocs.dev")}`)
    }
  } catch (error) {
    if (!quietMode) {
      console.error(pc.red("❌ Failed to create project:"), error)
    }
    process.exit(1)
  }
}

main().catch(console.error)
