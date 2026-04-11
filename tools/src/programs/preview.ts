import { Effect } from "effect"
import { execFile } from "node:child_process"
import { promisify } from "node:util"
import path from "node:path"
import { rootDirectory } from "../core/paths.js"
import { previewHost, previewPort } from "../core/preview.js"
import { startStaticServer } from "../core/server.js"
import { generateSite } from "./generate.js"

const execFileAsync = promisify(execFile)

const buildRenderedSite = Effect.tryPromise({
  try: async () => {
    await execFileAsync("bundle", [
      "exec",
      "jekyll",
      "build",
      "--source",
      "site",
      "--destination",
      "_site"
    ], { cwd: rootDirectory })
  },
  catch: (error) => new Error(`Unable to build rendered site: ${String(error)}`)
})

const program = Effect.gen(function* () {
  yield* generateSite
  yield* buildRenderedSite

  const { url } = yield* startStaticServer({
    rootDirectory: path.join(rootDirectory, "_site"),
    host: previewHost,
    port: previewPort
  })

  yield* Effect.log(`Preview ready: ${url}`)
  yield* Effect.log(`Serving rendered site from ${path.join(rootDirectory, "_site")}`)
  yield* Effect.never
})

export const previewSite = program
