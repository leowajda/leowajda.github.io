import { Effect } from "effect"
import { createHash } from "node:crypto"
import path from "node:path"
import type { CodeGraphError } from "../core/errors.js"
import { FileStore } from "../core/workspace.js"
import { mapWorkspaceError } from "./errors.js"
import type { GraphWorkspaceInput } from "./model.js"

const ignoredDirectoryNames = new Set([
  ".bsp",
  ".cache",
  ".git",
  ".idea",
  ".tmp",
  ".venv",
  "__pycache__",
  "build",
  "dist",
  "node_modules",
  "out",
  "target",
  "venv"
])

const fingerprintFileNames = new Set([
  "CMakeLists.txt",
  "Pipfile",
  "Pipfile.lock",
  "build.gradle",
  "build.gradle.kts",
  "build.properties",
  "build.sbt",
  "gradle.properties",
  "plugins.sbt",
  "poetry.lock",
  "pyproject.toml",
  "requirements-dev.txt",
  "requirements.txt",
  "settings.gradle",
  "settings.gradle.kts"
])

const fingerprintFileExtensions = new Set([".cmake", ".gradle", ".kts", ".sbt"])

const isFingerprintCandidate = (filePath: string, sourceExtensions: ReadonlyArray<string>) => {
  const extension = path.extname(filePath).toLowerCase()
  const baseName = path.basename(filePath)

  return sourceExtensions.includes(extension)
    || fingerprintFileNames.has(baseName)
    || fingerprintFileExtensions.has(extension)
}

const walkRelevantFiles = (
  workspace: GraphWorkspaceInput,
  directory: string,
  sourceExtensions: ReadonlyArray<string>
): Effect.Effect<ReadonlyArray<string>, CodeGraphError, FileStore> =>
  Effect.gen(function* () {
    const fileStore = yield* FileStore
    const entries = yield* fileStore.readDirectory(directory).pipe(
      Effect.mapError(mapWorkspaceError(workspace, "fingerprint-read-directory"))
    )

    const nested = yield* Effect.forEach(entries, (entry) => {
      const fullPath = path.join(directory, entry.name)
      if (entry.isDirectory()) {
        if (entry.name.startsWith(".") || ignoredDirectoryNames.has(entry.name)) {
          return Effect.succeed([] as ReadonlyArray<string>)
        }

        return walkRelevantFiles(workspace, fullPath, sourceExtensions)
      }

      return Effect.succeed(isFingerprintCandidate(fullPath, sourceExtensions) ? [fullPath] : [])
    }, { concurrency: 8 })

    return nested.flat()
  })

export const createWorkspaceFingerprint = (workspace: GraphWorkspaceInput) =>
  Effect.gen(function* () {
    const fileStore = yield* FileStore
    const files = yield* walkRelevantFiles(workspace, workspace.root_path, workspace.source_extensions)
    const digest = createHash("sha256")

    digest.update(workspace.kind)
    digest.update("\n")
    digest.update(workspace.primary_language)
    digest.update("\n")

    for (const filePath of [...files].sort()) {
      const relativePath = path.relative(workspace.root_path, filePath)
      const content = yield* fileStore.readBytes(filePath).pipe(
        Effect.mapError(mapWorkspaceError(workspace, "fingerprint-read-file", (error) => `${relativePath}: ${String(error)}`))
      )

      digest.update(relativePath)
      digest.update("\n")
      digest.update(content)
      digest.update("\n")
    }

    return digest.digest("hex")
  })
