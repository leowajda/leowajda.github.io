import { Effect } from "effect"
import path from "node:path"
import { ArchitectureArtifactWriteError } from "../core/errors.js"
import { generatedDocsDirectory, rootDirectory } from "../core/paths.js"
import { FileStore, WorkspaceLive } from "../core/workspace.js"
import type { ArchitectureDiagram, ArchitectureGraph } from "./schema.js"

type DiagramArtifact = {
  readonly diagram: ArchitectureDiagram
  readonly mermaid: string
  readonly svg: string
  readonly scene: string
}

const renderReadme = (diagrams: ReadonlyArray<ArchitectureDiagram>) =>
  [
    "# leowajda.github.io",
    "",
    diagrams.map((diagram) => `![${diagram.title}](docs/generated/${diagram.id}.svg)`).join("\n\n"),
    ""
  ].join("\n")

export class ArchitectureArtifactWriter extends Effect.Service<ArchitectureArtifactWriter>()("ArchitectureArtifactWriter", {
  effect: Effect.gen(function* () {
    const fileStore = yield* FileStore
    return {
      write: (graph: ArchitectureGraph, diagrams: ReadonlyArray<DiagramArtifact>) =>
        Effect.gen(function* () {
          yield* fileStore.removeDirectory(generatedDocsDirectory).pipe(
            Effect.mapError((error) => new ArchitectureArtifactWriteError({ target: generatedDocsDirectory, reason: String(error) }))
          )
          yield* fileStore.writeText(path.join(generatedDocsDirectory, "architecture.json"), JSON.stringify(graph, null, 2)).pipe(
            Effect.mapError((error) => new ArchitectureArtifactWriteError({ target: "architecture.json", reason: String(error) }))
          )
          yield* fileStore.writeText(path.join(rootDirectory, "README.md"), renderReadme(diagrams.map((entry) => entry.diagram))).pipe(
            Effect.mapError((error) => new ArchitectureArtifactWriteError({ target: "README.md", reason: String(error) }))
          )
          yield* Effect.forEach(diagrams, ({ diagram, mermaid, svg, scene }) =>
            Effect.all([
              fileStore.writeText(path.join(generatedDocsDirectory, `${diagram.id}.mmd`), mermaid),
              fileStore.writeText(path.join(generatedDocsDirectory, `${diagram.id}.excalidraw.json`), scene),
              fileStore.writeText(path.join(generatedDocsDirectory, `${diagram.id}.svg`), svg)
            ]).pipe(
              Effect.mapError((error) => new ArchitectureArtifactWriteError({ target: diagram.id, reason: String(error) }))
            ),
          { concurrency: 1 }).pipe(
            Effect.asVoid,
            Effect.withLogSpan("architecture.artifacts.write"),
            Effect.annotateLogs({ component: "architecture-write" })
          )
        })
    }
  }),
  dependencies: [WorkspaceLive],
  accessors: true
}) {}
