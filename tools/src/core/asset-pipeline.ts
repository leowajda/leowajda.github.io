import { Effect } from "effect"
import { build } from "esbuild"
import { execFile } from "node:child_process"
import fs from "node:fs/promises"
import path from "node:path"
import { promisify } from "node:util"
import { AssetBuildError } from "./errors.js"
import { generatedSiteDirectory, nodeModulesDirectory, rootDirectory } from "./paths.js"

const execFileAsync = promisify(execFile)

const assetBuildFailure = (error: unknown) =>
  new AssetBuildError({ reason: String(error) })

const buildSiteBundle = Effect.tryPromise({
  try: () => build({
    entryPoints: {
      core: path.join(rootDirectory, "packages/ui/src/core.ts"),
      "eureka-filters": path.join(rootDirectory, "packages/ui/src/eureka-filters.ts"),
      math: path.join(rootDirectory, "packages/ui/src/math.ts")
    },
    bundle: true,
    format: "iife",
    target: "es2022",
    outdir: path.join(generatedSiteDirectory, "assets/js"),
    entryNames: "[name]",
    minify: false,
    sourcemap: false,
    logLevel: "silent"
  }),
  catch: assetBuildFailure
})

const buildSiteStyles = Effect.tryPromise({
  try: async () => {
    await fs.mkdir(path.join(generatedSiteDirectory, "assets/css"), { recursive: true })
    await execFileAsync(path.join(nodeModulesDirectory, ".bin", "tailwindcss"), [
      "-i",
      path.join(rootDirectory, "styles/main.css"),
      "-o",
      path.join(generatedSiteDirectory, "assets/css/main.css")
    ], {
      cwd: rootDirectory
    })
  },
  catch: assetBuildFailure
})

const copyKatexAssets = Effect.tryPromise({
  try: async () => {
    const katexDirectory = path.join(nodeModulesDirectory, "katex/dist")
    await fs.mkdir(path.join(generatedSiteDirectory, "assets/vendor/katex/fonts"), { recursive: true })
    await fs.copyFile(
      path.join(katexDirectory, "katex.min.css"),
      path.join(generatedSiteDirectory, "assets/vendor/katex/katex.min.css")
    )
    const fontEntries = await fs.readdir(path.join(katexDirectory, "fonts"))
    await Promise.all(fontEntries.map((entry) =>
      fs.copyFile(
        path.join(katexDirectory, "fonts", entry),
        path.join(generatedSiteDirectory, "assets/vendor/katex/fonts", entry)
      )
    ))
  },
  catch: assetBuildFailure
})

export const buildBrowserAssets = Effect.all([
  buildSiteBundle,
  buildSiteStyles,
  copyKatexAssets
]).pipe(Effect.asVoid)
