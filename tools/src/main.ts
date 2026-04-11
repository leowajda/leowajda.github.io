import { Command } from "@effect/cli"
import { NodeContext, NodeRuntime } from "@effect/platform-node"
import { Effect } from "effect"
import { refreshDocs } from "./programs/docs.js"
import { generateSite } from "./programs/generate.js"
import { previewSite } from "./programs/preview.js"
import { syncSources } from "./programs/sync.js"

const refreshGraphsFlag = "--refresh-graphs"
const refreshGraphs = process.argv.includes(refreshGraphsFlag)
if (refreshGraphs) {
  process.env.SOURCE_GRAPH_REFRESH = "1"
}

const argv = process.argv.filter((argument) => argument !== refreshGraphsFlag)

const docs = Command.make("docs", {}, () => refreshDocs)
const generate = Command.make("generate", {}, () => generateSite)
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
