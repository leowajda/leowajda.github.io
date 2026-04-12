import { Context, Effect, Layer } from "effect"
import path from "node:path"
import type { CodeReferencesPanel } from "../../../packages/graph/src/index.js"
import { CodeGraphError } from "../core/errors.js"
import { rootDirectory } from "../core/paths.js"
import { CommandRunner, FileStore } from "../core/workspace.js"
import { GraphBuildSettings } from "./mode.js"
import type { GraphArtifact, GraphWorkspaceInput } from "./model.js"
import { buildCodeReferencesPanel } from "./projector.js"
import { buildGraphArtifactFromScip } from "./scip.js"
import {
  cacheIndexPath,
  ensureWorkspaceCacheDirectory,
  readArtifactCache,
  readLatestArtifactCache,
  writeArtifactCacheFiles
} from "./cache.js"
import { mapWorkspaceError } from "./errors.js"
import { createWorkspaceFingerprint } from "./fingerprint.js"
import { runWorkspaceIndexer } from "./indexer.js"

interface CodeGraphToolchainService {
  readonly buildArtifact: (
    workspace: GraphWorkspaceInput
  ) => Effect.Effect<GraphArtifact | null, CodeGraphError, FileStore | CommandRunner | GraphBuildSettings>
}

class CodeGraphToolchain extends Context.Tag("CodeGraphToolchain")<
  CodeGraphToolchain,
  CodeGraphToolchainService
>() {}

const CodeGraphToolchainLive = Layer.succeed(CodeGraphToolchain, {
  buildArtifact: (workspace) =>
    Effect.gen(function* () {
      const fileStore = yield* FileStore
      const { mode: buildMode } = yield* GraphBuildSettings

      if (buildMode === "cache-only") {
        return yield* readLatestArtifactCache(workspace)
      }

      const fingerprint = yield* createWorkspaceFingerprint(workspace)

      if (buildMode === "build") {
        const cached = yield* readArtifactCache(workspace, fingerprint)
        if (cached !== null) {
          yield* writeArtifactCacheFiles(workspace, fingerprint, cached)
          return cached
        }
      }

      const outputPath = cacheIndexPath(workspace, fingerprint)
      yield* ensureWorkspaceCacheDirectory(workspace, fingerprint)
      yield* runWorkspaceIndexer(workspace, outputPath)

      const rawIndex = yield* fileStore.readBytes(outputPath).pipe(
        Effect.mapError(mapWorkspaceError(workspace, "index-read"))
      )

      const artifact = yield* buildGraphArtifactFromScip(workspace, rawIndex)
      yield* writeArtifactCacheFiles(workspace, fingerprint, artifact)
      return artifact
    })
})

export const buildCodeReferencePanels = (
  workspaces: ReadonlyArray<GraphWorkspaceInput>
): Effect.Effect<ReadonlyMap<string, CodeReferencesPanel | null>, CodeGraphError, FileStore | CommandRunner | GraphBuildSettings> =>
  Effect.gen(function* () {
    const toolchain = yield* CodeGraphToolchain
    const panelMaps = yield* Effect.forEach(workspaces, (workspace) =>
      Effect.gen(function* () {
        const artifact = yield* toolchain.buildArtifact(workspace)
        if (artifact === null) {
          return new Map(
            workspace.documents.map((document) => [document.id, null] as const)
          )
        }

        return new Map(
          workspace.documents.map((document) => [document.id, buildCodeReferencesPanel(artifact, workspace, document)] as const)
        )
      })
    , { concurrency: 2 })

    return new Map(panelMaps.flatMap((panelMap) => Array.from(panelMap.entries())))
  }).pipe(
    Effect.provide(CodeGraphToolchainLive)
  )
