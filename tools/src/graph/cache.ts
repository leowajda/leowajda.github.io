import { Effect, Schema } from "effect"
import path from "node:path"
import { FileStore } from "../core/workspace.js"
import type { CodeGraphError } from "../core/errors.js"
import { rootDirectory } from "../core/paths.js"
import { codeGraphError, formatSchemaError, mapWorkspaceError } from "./errors.js"
import { GraphArtifactSchema, GraphArtifactVersion, type GraphArtifact, type GraphWorkspaceInput } from "./model.js"

export const graphCacheDirectory = path.join(rootDirectory, ".cache", "code-graphs")
export const graphBinaryDirectory = path.join(graphCacheDirectory, "bin")
export const graphWorkspaceDirectory = path.join(graphCacheDirectory, "workspaces")

const GraphArtifactCacheSchema = Schema.Struct({
  version: Schema.Literal(GraphArtifactVersion),
  fingerprint: Schema.String,
  artifact: GraphArtifactSchema
})

export const safeCacheSegment = (value: string) =>
  value.replace(/[^a-zA-Z0-9._-]/g, "_")

const workspaceCacheRootDirectory = (workspace: GraphWorkspaceInput) =>
  path.join(
    graphWorkspaceDirectory,
    safeCacheSegment(workspace.project_slug),
    safeCacheSegment(workspace.workspace_slug)
  )

export const workspaceCacheDirectory = (workspace: GraphWorkspaceInput, fingerprint: string) =>
  path.join(workspaceCacheRootDirectory(workspace), fingerprint)

const cacheFilePath = (workspace: GraphWorkspaceInput, fingerprint: string) =>
  path.join(workspaceCacheDirectory(workspace, fingerprint), "artifact.json")

export const cacheIndexPath = (workspace: GraphWorkspaceInput, fingerprint: string) =>
  path.join(workspaceCacheDirectory(workspace, fingerprint), "index.scip")

const latestCacheFilePath = (workspace: GraphWorkspaceInput) =>
  path.join(workspaceCacheRootDirectory(workspace), "latest.json")

const readCachePayload = (
  workspace: GraphWorkspaceInput,
  filePath: string,
  phasePrefix: string
): Effect.Effect<Schema.Schema.Type<typeof GraphArtifactCacheSchema> | null, never, FileStore> =>
  Effect.gen(function* () {
    const fileStore = yield* FileStore
    const exists = yield* fileStore.fileExists(filePath)
    if (!exists) {
      return null
    }

    const raw = yield* fileStore.readText(filePath).pipe(
      Effect.mapError(mapWorkspaceError(workspace, `${phasePrefix}-read`))
    )

    const decoded = yield* Effect.try({
      try: () => JSON.parse(raw) as unknown,
      catch: mapWorkspaceError(workspace, `${phasePrefix}-json`)
    })

    const payload = yield* Schema.decodeUnknown(GraphArtifactCacheSchema)(decoded).pipe(
      Effect.mapError(mapWorkspaceError(workspace, `${phasePrefix}-decode`, formatSchemaError))
    )

    return payload
  }).pipe(
    Effect.catchAll(() => Effect.succeed(null))
  )

export const readArtifactCache = (workspace: GraphWorkspaceInput, fingerprint: string) =>
  readCachePayload(workspace, cacheFilePath(workspace, fingerprint), "cache").pipe(
    Effect.map((payload) => payload?.fingerprint === fingerprint ? payload.artifact : null)
  )

export const readLatestArtifactCache = (workspace: GraphWorkspaceInput) =>
  readCachePayload(workspace, latestCacheFilePath(workspace), "cache-latest").pipe(
    Effect.map((payload) => payload?.artifact ?? null)
  )

const encodeGraphArtifactCache = (workspace: GraphWorkspaceInput, fingerprint: string, artifact: GraphArtifact) =>
  Schema.encode(GraphArtifactCacheSchema)({
    version: GraphArtifactVersion,
    fingerprint,
    artifact
  }).pipe(
    Effect.mapError(mapWorkspaceError(workspace, "cache-encode", formatSchemaError))
  )

export const writeArtifactCacheFiles = (
  workspace: GraphWorkspaceInput,
  fingerprint: string,
  artifact: GraphArtifact
): Effect.Effect<void, CodeGraphError, FileStore> =>
  Effect.gen(function* () {
    const fileStore = yield* FileStore
    const encoded = yield* encodeGraphArtifactCache(workspace, fingerprint, artifact)
    const serialized = `${JSON.stringify(encoded, null, 2)}\n`

    yield* fileStore.writeText(cacheFilePath(workspace, fingerprint), serialized).pipe(
      Effect.mapError(mapWorkspaceError(workspace, "cache-write"))
    )

    yield* fileStore.writeText(latestCacheFilePath(workspace), serialized).pipe(
      Effect.mapError(mapWorkspaceError(workspace, "cache-latest-write"))
    )
  })

export const ensureWorkspaceCacheDirectory = (
  workspace: GraphWorkspaceInput,
  fingerprint: string
): Effect.Effect<void, CodeGraphError, FileStore> =>
  Effect.gen(function* () {
    const fileStore = yield* FileStore
    yield* fileStore.makeDirectory(workspaceCacheDirectory(workspace, fingerprint)).pipe(
      Effect.mapError(mapWorkspaceError(workspace, "cache-directory"))
    )
  })

export const failMissingJavaRuntime = (workspace: GraphWorkspaceInput) =>
  Effect.fail(codeGraphError(workspace, "java-runtime", "Unable to resolve a compiler-capable JDK for scip-java"))
