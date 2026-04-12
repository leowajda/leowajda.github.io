import { Command } from "@effect/cli"
import { NodeContext, NodeRuntime } from "@effect/platform-node"
import { Effect } from "effect"
import { GraphBuildSettings, type GraphBuildMode } from "./graph/mode.js"
import { refreshDocs } from "./programs/docs.js"
import { generateSite } from "./programs/generate.js"
import { previewSite } from "./programs/preview.js"
import { syncSources } from "./programs/sync.js"

const refreshGraphsFlag = "--refresh-graphs"
const refreshGraphs = process.argv.includes(refreshGraphsFlag)
const graphBuildMode: GraphBuildMode = refreshGraphs ? "refresh" : "build"

const argv = process.argv.filter((argument) => argument !== refreshGraphsFlag)

const docs = Command.make("docs", {}, () => refreshDocs)
const generate = Command.make("generate", {}, () =>
  generateSite.pipe(Effect.provide(GraphBuildSettings.layer(graphBuildMode)))
)
const preview = Command.make("preview", {}, () => Effect.scoped(previewSite))
const sync = Command.make("sync-sources", {}, () => syncSources)

const root = Command.make("leowajda.github.io", {}, () => Effect.void).pipe(
  Command.withSubcommands([docs, generate, preview, sync])
)

const cli = Command.run(root, {
  name: "leowajda.github.io",
  version: "v0.1.0"
})

cli(argv).pipe(Effect.provide(NodeContext.layer), NodeRuntime.runMain)
