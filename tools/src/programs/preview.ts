import { Effect } from "effect"
import { spawn } from "node:child_process"
import { GraphBuildSettings } from "../graph/mode.js"
import { rootDirectory } from "../core/paths.js"
import { previewHost, previewPort } from "../core/preview.js"
import { generateSite } from "./generate.js"

const startJekyllPreview = Effect.acquireRelease(
  Effect.try({
    try: () => {
      const child = spawn("bundle", [
        "exec",
        "jekyll",
        "serve",
        "--source",
        "site",
        "--destination",
        "_site",
        "--host",
        previewHost,
        "--port",
        String(previewPort),
        "--livereload"
      ], {
        cwd: rootDirectory,
        stdio: "inherit"
      })

      return child
    },
    catch: (error) => new Error(`Unable to start preview server: ${String(error)}`)
  }),
  (child) =>
    Effect.sync(() => {
      child.kill("SIGTERM")
    })
)

const program = Effect.gen(function* () {
  yield* generateSite.pipe(Effect.provide(GraphBuildSettings.layer("cache-only")))
  yield* startJekyllPreview

  yield* Effect.log(`Preview ready: http://${previewHost}:${previewPort}`)
  yield* Effect.never
})

export const previewSite = program
