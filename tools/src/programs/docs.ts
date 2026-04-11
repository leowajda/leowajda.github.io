import { Effect, Layer, ManagedRuntime } from "effect"
import { compileArchitectureDiagrams } from "../architecture/compile.js"
import { ArchitectureConfigRepository } from "../architecture/config.js"
import { ArchitectureDiscovery, ProjectManifestRepository } from "../architecture/discovery.js"
import { buildArchitectureGraph } from "../architecture/graph.js"
import { DiagramRenderer } from "../architecture/render.js"
import { ArchitectureSettings } from "../architecture/settings.js"
import { ArchitectureArtifactWriter } from "../architecture/write.js"

const program = Effect.gen(function* () {
  const settings = yield* ArchitectureSettings
  yield* Effect.logInfo("Refreshing architecture docs").pipe(
    Effect.annotateLogs({ component: "architecture-docs" })
  )
  const config = yield* ArchitectureConfigRepository.load()
  const manifests = yield* ProjectManifestRepository.loadAll()
  const facts = yield* ArchitectureDiscovery.discover()
  const graph = yield* buildArchitectureGraph(config, manifests, facts)
  const diagrams = yield* compileArchitectureDiagrams(config, graph)
  const renderedDiagrams = yield* Effect.forEach(diagrams, (diagram) =>
    DiagramRenderer.render(graph, diagram).pipe(
      Effect.map(({ mermaid, rendered }) => ({
        diagram,
        mermaid,
        svg: rendered.svg,
        scene: rendered.scene
      }))
    ),
  { concurrency: settings.renderConcurrency })

  yield* ArchitectureArtifactWriter.write(graph, renderedDiagrams)
}).pipe(
  Effect.withLogSpan("architecture.docs.refresh")
)

const DocsLive = Layer.mergeAll(
  ArchitectureSettings.Default,
  ArchitectureConfigRepository.Default,
  ProjectManifestRepository.Default,
  ArchitectureDiscovery.Default,
  ArchitectureArtifactWriter.Default,
  DiagramRenderer.Default
)

const DocsRuntime = ManagedRuntime.make(DocsLive)

export const refreshDocs = Effect.acquireUseRelease(
  Effect.succeed(DocsRuntime),
  (runtime) => Effect.tryPromise(() => runtime.runPromise(program)).pipe(Effect.asVoid),
  (runtime) => Effect.promise(() => runtime.dispose())
)
