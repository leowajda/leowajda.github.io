import { Effect } from "effect"
import { GraphBuildSettings } from "../graph/mode.js"
import { startJekyllPreview } from "../core/jekyll-preview.js"
import { previewHost, previewPort } from "../core/preview.js"
import { generateSite } from "./generate.js"

const program = Effect.gen(function* () {
  yield* generateSite.pipe(Effect.provide(GraphBuildSettings.layer("cache-only")))
  yield* startJekyllPreview

  yield* Effect.log(`Preview ready: http://${previewHost}:${previewPort}`)
  yield* Effect.never
})

export const previewSite = program
