import { Effect } from "effect"
import { build } from "esbuild"
import { execFile } from "node:child_process"
import fs from "node:fs/promises"
import path from "node:path"
import { promisify } from "node:util"
import { AssetBuildError } from "./errors.js"
import { generatedSiteDirectory, nodeModulesDirectory, rootDirectory } from "./paths.js"

const execFileAsync = promisify(execFile)

export const buildBrowserAssets = Effect.tryPromise({
  try: async () => {
    await build({
      entryPoints: {
        site: path.join(rootDirectory, "packages/ui/src/site.ts")
      },
      bundle: true,
      format: "iife",
      target: "es2022",
      outdir: path.join(generatedSiteDirectory, "assets/js"),
      minify: false,
      sourcemap: false,
      logLevel: "silent"
    })

    await fs.mkdir(path.join(generatedSiteDirectory, "assets/css"), { recursive: true })
    await execFileAsync(path.join(nodeModulesDirectory, ".bin", "tailwindcss"), [
      "-i",
      path.join(rootDirectory, "styles/main.css"),
      "-o",
      path.join(generatedSiteDirectory, "assets/css/main.css")
    ], {
      cwd: rootDirectory
    })

    const katexDirectory = path.join(nodeModulesDirectory, "katex/dist")
    await fs.mkdir(path.join(generatedSiteDirectory, "assets/vendor/katex/fonts"), { recursive: true })
    await fs.copyFile(path.join(katexDirectory, "katex.min.css"), path.join(generatedSiteDirectory, "assets/vendor/katex/katex.min.css"))
    const fontEntries = await fs.readdir(path.join(katexDirectory, "fonts"))
    await Promise.all(fontEntries.map((entry) =>
      fs.copyFile(path.join(katexDirectory, "fonts", entry), path.join(generatedSiteDirectory, "assets/vendor/katex/fonts", entry))
    ))
  },
  catch: (error) => new AssetBuildError({ reason: String(error) })
})
