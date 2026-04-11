import { Effect } from "effect"
import path from "node:path"
import { SourceNotesError } from "../../core/errors.js"
import { CommandRunner, FileStore } from "../../core/workspace.js"
import type { SourceNotesDocument } from "./schema.js"

export type GraphModuleInput = {
  readonly slug: string
  readonly absolutePath: string
  readonly relativePath: string
  readonly documents: ReadonlyArray<SourceNotesDocument>
}

export type GraphPathEdge = {
  readonly source_path: string
  readonly target_path: string
}

export type GraphExtractionContext = {
  readonly projectSlug: string
  readonly repoRoot: string
  readonly module: GraphModuleInput
}

export type LanguageGraphExtractor = {
  readonly language: string
  readonly extractModuleEdges: (
    context: GraphExtractionContext
  ) => Effect.Effect<ReadonlyArray<GraphPathEdge>, SourceNotesError, CommandRunner | FileStore>
}

const formatUnknownError = (error: unknown) => {
  if (error && typeof error === "object") {
    const command = "command" in error && typeof error.command === "string" ? error.command : ""
    const workingDirectory = "workingDirectory" in error && typeof error.workingDirectory === "string"
      ? error.workingDirectory
      : ""
    const reason = "reason" in error && typeof error.reason === "string" ? error.reason : String(error)

    if (command || workingDirectory) {
      return `${command} @ ${workingDirectory}: ${reason}`
    }

    return reason
  }

  return String(error)
}

export const runCommandOrFail = (
  projectSlug: string,
  phase: string,
  workingDirectory: string,
  command: string,
  args: ReadonlyArray<string>
): Effect.Effect<string, SourceNotesError, CommandRunner> =>
  Effect.gen(function* () {
    const commandRunner = yield* CommandRunner
    return yield* commandRunner.runCommand(workingDirectory, command, args).pipe(
      Effect.mapError((error) => new SourceNotesError({
        slug: projectSlug,
        phase,
        reason: formatUnknownError(error)
      }))
    )
  })

export const readFilesRecursively = (
  projectSlug: string,
  directory: string,
  extension: string
): Effect.Effect<ReadonlyArray<string>, SourceNotesError, FileStore> =>
  Effect.gen(function* () {
    const fileStore = yield* FileStore
    const exists = yield* fileStore.fileExists(directory)
    if (!exists) {
      return []
    }

    const entries = yield* fileStore.readDirectory(directory).pipe(
      Effect.mapError((error) => new SourceNotesError({
        slug: projectSlug,
        phase: "graph-read-directory",
        reason: String(error)
      }))
    )

    const nested = yield* Effect.forEach(entries, (entry) => {
      const fullPath = path.join(directory, entry.name)
      if (entry.isDirectory()) {
        return readFilesRecursively(projectSlug, fullPath, extension)
      }

      return Effect.succeed(fullPath.endsWith(extension) ? [fullPath] : [])
    }, { concurrency: 8 })

    return nested.flat()
  })
