import { existsSync, readFileSync } from "fs"
import { resolve } from "path"
import { pathToFileURL } from "url"
import * as v from "valibot"

import type { DocConfig } from "./types"
import { DocConfigSchema } from "./types"

async function runtimeImport(
  modulePath: string,
): Promise<{ default?: unknown } & Record<string, unknown>> {
  // Create the importer at runtime so bundlers do not try to resolve dynamic file paths.
  // eslint-disable-next-line @typescript-eslint/no-implied-eval
  const dynamicImport = new Function("specifier", "return import(specifier)") as (
    specifier: string,
  ) => Promise<{ default?: unknown } & Record<string, unknown>>

  return dynamicImport(modulePath)
}

export function validateDocConfig(config: unknown): DocConfig {
  return v.parse(DocConfigSchema, config)
}

/**
 * Helper function for type-safe config definition
 */
export function defineConfig(config: DocConfig): DocConfig {
  return config
}

/**
 * Loads the documentation configuration from a pkgdocs.config.mjs, pkgdocs.config.js, or pkgdocs.config.json file
 * @param configPath - Path to the config file (defaults to process.cwd()/pkgdocs.config.mjs or pkgdocs.config.js or pkgdocs.config.json)
 * @returns The parsed configuration object
 */
export async function loadDocConfig(configPath?: string): Promise<DocConfig> {
  const basePath = configPath ? resolve(configPath) : resolve(process.cwd())
  const mjsConfigPath = resolve(basePath, "pkgdocs.config.mjs")
  const jsConfigPath = resolve(basePath, "pkgdocs.config.js")
  const jsonConfigPath = resolve(basePath, "pkgdocs.config.json")

  let configPath_: string | undefined

  if (existsSync(mjsConfigPath)) {
    configPath_ = mjsConfigPath
  } else if (existsSync(jsConfigPath)) {
    configPath_ = jsConfigPath
  } else if (existsSync(jsonConfigPath)) {
    configPath_ = jsonConfigPath
  }

  if (!configPath_) {
    // eslint-disable-next-line no-console
    console.warn(
      `Config file not found in ${basePath}. Checked for pkgdocs.config.mjs, pkgdocs.config.js, and pkgdocs.config.json. Using default configuration.`,
    )
    return {}
  }

  try {
    if (configPath_.endsWith(".json")) {
      const content = readFileSync(configPath_, "utf-8")
      return validateDocConfig(JSON.parse(content))
    }

    // Use runtime dynamic import so bundlers do not attempt to statically resolve file paths.
    const fileUrl = pathToFileURL(configPath_).href
    const imported = await runtimeImport(fileUrl)
    const config = imported.default ?? imported

    if (typeof config === "function") {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      return validateDocConfig(config())
    }

    return validateDocConfig(config)
  } catch (error) {
    throw new Error(
      `Failed to load config file at ${configPath_}: ${error instanceof Error ? error.message : String(error)}`,
    )
  }
}

export type { DocConfig, FrameworkConfig } from "./types"
