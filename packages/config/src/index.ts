import { existsSync, readFileSync } from "fs"
import { resolve } from "path"
import { pathToFileURL } from "url"

import type { DocConfigFile } from "./types"

const runtimeImport = new Function("modulePath", "return import(modulePath)") as (
  modulePath: string,
) => Promise<{ default?: unknown } & Record<string, unknown>>

/**
 * Helper function for type-safe config definition
 */
export function defineConfig(config: DocConfigFile): DocConfigFile {
  return config
}

/**
 * Loads the documentation configuration from a config.mjs, config.js, or config.json file
 * @param configPath - Path to the config file (defaults to process.cwd()/config.mjs or config.js or config.json)
 * @returns The parsed configuration object
 */
export async function loadDocConfig(configPath?: string): Promise<DocConfigFile> {
  const basePath = configPath ? resolve(configPath) : resolve(process.cwd())
  const mjsConfigPath = resolve(basePath, "config.mjs")
  const jsConfigPath = resolve(basePath, "config.js")
  const jsonConfigPath = resolve(basePath, "config.json")

  let configPath_: string | undefined

  if (existsSync(mjsConfigPath)) {
    configPath_ = mjsConfigPath
  } else if (existsSync(jsConfigPath)) {
    configPath_ = jsConfigPath
  } else if (existsSync(jsonConfigPath)) {
    configPath_ = jsonConfigPath
  }

  if (!configPath_) {
    console.warn(
      `Config file not found in ${basePath}. Checked for config.mjs, config.js, and config.json. Using default configuration.`,
    )
    return {}
  }

  try {
    if (configPath_.endsWith(".json")) {
      const content = readFileSync(configPath_, "utf-8")
      return JSON.parse(content) as DocConfigFile
    }

    // Use runtime dynamic import so bundlers do not attempt to statically resolve file paths.
    const fileUrl = pathToFileURL(configPath_).href
    const imported = await runtimeImport(fileUrl)
    const config = imported.default ?? imported

    if (typeof config === "function") {
      return config()
    }

    return config as DocConfigFile
  } catch (error) {
    throw new Error(
      `Failed to load config file at ${configPath_}: ${error instanceof Error ? error.message : String(error)}`,
    )
  }
}

export type { DocConfigFile } from "./types"
