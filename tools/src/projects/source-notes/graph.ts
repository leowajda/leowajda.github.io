import { Context, Effect, Layer, ParseResult, Schema } from "effect"
import path from "node:path"
import { SourceNotesError } from "../../core/errors.js"
import { rootDirectory } from "../../core/paths.js"
import type { CommandRunner, FileStore } from "../../core/workspace.js"
import { FileStore as FileStoreTag } from "../../core/workspace.js"
import { JavaLanguageGraphExtractor } from "./graph-java.js"
import type { GraphModuleInput, LanguageGraphExtractor } from "./graph-model.js"
import { ScalaLanguageGraphExtractor } from "./graph-scala.js"
import type { SourceProjectGraph } from "./schema.js"

const graphExtractors: ReadonlyArray<LanguageGraphExtractor> = [
  JavaLanguageGraphExtractor,
  ScalaLanguageGraphExtractor
]

interface SourceGraphToolchainService {
  readonly extractForLanguage: (
    extractor: LanguageGraphExtractor,
    slug: string,
    repoRoot: string,
    module: GraphModuleInput
  ) => Effect.Effect<
    ReadonlyArray<{ readonly source_path: string; readonly target_path: string }>,
    SourceNotesError,
    CommandRunner | FileStore
  >
}

class SourceGraphToolchain extends Context.Tag("SourceGraphToolchain")<
  SourceGraphToolchain,
  SourceGraphToolchainService
>() {}

const GraphPathEdgeSchema = Schema.Struct({
  source_path: Schema.String,
  target_path: Schema.String
})

const GraphEdgeCacheSchema = Schema.Struct({
  version: Schema.Literal(1),
  edges: Schema.Array(GraphPathEdgeSchema)
})

const graphCacheDirectory = path.join(rootDirectory, ".cache", "source-graphs")
const refreshGraphsEnabled = process.env.SOURCE_GRAPH_REFRESH === "1"

const formatSchemaError = (error: ParseResult.ParseError) =>
  ParseResult.TreeFormatter.formatErrorSync(error)

const cacheFilePath = (slug: string, moduleSlug: string, language: string) =>
  path.join(graphCacheDirectory, slug, moduleSlug, `${language}.json`)

const writeEdgeCache = (
  slug: string,
  moduleSlug: string,
  language: string,
  edges: ReadonlyArray<{ readonly source_path: string; readonly target_path: string }>
) =>
  Effect.gen(function* () {
    const fileStore = yield* FileStoreTag
    const encoded = yield* Schema.encode(GraphEdgeCacheSchema)({
      version: 1 as const,
      edges
    }).pipe(
      Effect.mapError((error) => new SourceNotesError({
        slug,
        phase: "graph-cache-encode",
        reason: `${moduleSlug}/${language}: ${formatSchemaError(error)}`
      }))
    )

    yield* fileStore.writeText(cacheFilePath(slug, moduleSlug, language), `${JSON.stringify(encoded, null, 2)}\n`).pipe(
      Effect.mapError((error) => new SourceNotesError({
        slug,
        phase: "graph-cache-write",
        reason: `${moduleSlug}/${language}: ${String(error)}`
      }))
    )
  })

const readEdgeCache = (
  slug: string,
  moduleSlug: string,
  language: string
) =>
  Effect.gen(function* () {
    const fileStore = yield* FileStoreTag
    const filePath = cacheFilePath(slug, moduleSlug, language)
    const exists = yield* fileStore.fileExists(filePath)
    if (!exists) {
      return null
    }

    const raw = yield* fileStore.readText(filePath).pipe(
      Effect.mapError((error) => new SourceNotesError({
        slug,
        phase: "graph-cache-read",
        reason: `${moduleSlug}/${language}: ${String(error)}`
      }))
    )

    const decoded = yield* Effect.try({
      try: () => JSON.parse(raw) as unknown,
      catch: (error) => new SourceNotesError({
        slug,
        phase: "graph-cache-json",
        reason: `${moduleSlug}/${language}: ${String(error)}`
      })
    })

    const payload = yield* Schema.decodeUnknown(GraphEdgeCacheSchema)(decoded).pipe(
      Effect.mapError((error) => new SourceNotesError({
        slug,
        phase: "graph-cache-decode",
        reason: `${moduleSlug}/${language}: ${formatSchemaError(error)}`
      }))
    )

    return payload.edges
  }).pipe(
    Effect.catchAll(() => Effect.succeed(null))
  )

const SourceGraphToolchainLive = Layer.succeed(SourceGraphToolchain, {
  extractForLanguage: (extractor, slug, repoRoot, module) =>
    Effect.gen(function* () {
      if (!refreshGraphsEnabled) {
        const cached = yield* readEdgeCache(slug, module.slug, extractor.language)
        if (cached !== null) {
          return cached
        }
      }

      const extracted = yield* extractor.extractModuleEdges({
        projectSlug: slug,
        repoRoot,
        module
      })
      yield* writeEdgeCache(slug, module.slug, extractor.language, extracted)
      return extracted
    })
})

export const buildProjectGraph = (
  slug: string,
  repoRoot: string,
  modules: ReadonlyArray<GraphModuleInput>
): Effect.Effect<SourceProjectGraph, SourceNotesError, CommandRunner | FileStore> =>
  Effect.gen(function* () {
    const toolchain = yield* SourceGraphToolchain
    const codeDocuments = modules
      .flatMap((module) => module.documents)
      .filter((document) => document.format === "code")

    const documentsBySourcePath = new Map(codeDocuments.map((document) => [document.source_path, document]))

    const moduleEdges = yield* Effect.forEach(modules, (module) =>
      Effect.gen(function* () {
        const moduleLanguages = new Set(
          module.documents
            .filter((document) => document.format === "code")
            .map((document) => document.language)
        )

        const extractors = graphExtractors.filter((extractor) => moduleLanguages.has(extractor.language))
        if (extractors.length === 0) {
          return [] as ReadonlyArray<{ readonly source_path: string; readonly target_path: string }>
        }

        const extracted = yield* Effect.forEach(extractors, (extractor) =>
          toolchain.extractForLanguage(extractor, slug, repoRoot, module)
        , { concurrency: 1 })

        return extracted.flat()
      })
    , { concurrency: 1 })

    const uniqueEdges = new Set<string>()
    moduleEdges.flat().forEach((edge) => {
      const source = documentsBySourcePath.get(edge.source_path)
      const target = documentsBySourcePath.get(edge.target_path)
      if (!source || !target) {
        return
      }
      if (source.graph_node_id === target.graph_node_id) {
        return
      }
      uniqueEdges.add(`${source.graph_node_id}|${target.graph_node_id}`)
    })

    return {
      version: 1 as const,
      project_slug: slug,
      nodes: codeDocuments.map((document) => ({
        id: document.graph_node_id,
        label: document.title,
        url: document.url,
        tree_path: document.tree_path,
        language: document.language
      })),
      edges: Array.from(uniqueEdges).map((entry) => {
        const [source, target] = entry.split("|")
        return { source, target, kind: "reference" as const }
      })
    } satisfies SourceProjectGraph
  }).pipe(
    Effect.provide(SourceGraphToolchainLive)
  )
