import { Effect } from "effect"
import path from "node:path"
import { discoverArchitectureGraph } from "../architecture/discover.js"
import { renderArchitectureMermaid } from "../architecture/mermaid.js"
import { renderReadme } from "../architecture/readme.js"
import { renderMermaidToExcalidraw } from "../architecture/render.js"
import { generatedDocsDirectory, rootDirectory } from "../core/paths.js"
import { FileStore, WorkspaceLive } from "../core/workspace.js"

const program = Effect.gen(function* () {
  const fileStore = yield* FileStore
  const graph = yield* discoverArchitectureGraph
  const mermaid = renderArchitectureMermaid(graph)
  const rendered = yield* renderMermaidToExcalidraw("architecture", mermaid)
  const readme = renderReadme(graph)

  yield* fileStore.writeText(path.join(generatedDocsDirectory, "architecture.json"), JSON.stringify(graph, null, 2))
  yield* fileStore.writeText(path.join(generatedDocsDirectory, "architecture.mmd"), mermaid)
  yield* fileStore.writeText(path.join(generatedDocsDirectory, "architecture.excalidraw.json"), rendered.scene)
  yield* fileStore.writeText(path.join(generatedDocsDirectory, "architecture.svg"), rendered.svg)
  yield* fileStore.writeText(path.join(rootDirectory, "README.md"), readme)
})

export const refreshDocs = program.pipe(Effect.provide(WorkspaceLive))
