import { Effect } from "effect"
import path from "node:path"
import { rootDirectory } from "../core/paths.js"
import { CommandRunner, FileStore } from "../core/workspace.js"
import { graphBinaryDirectory, graphWorkspaceDirectory, safeCacheSegment } from "./cache.js"
import { formatCommandError, mapWorkspaceError } from "./errors.js"
import type { GraphWorkspaceInput } from "./model.js"

const scipClangVersion = "v0.4.0"
const scipClangDownloadUrl = `https://github.com/sourcegraph/scip-clang/releases/download/${scipClangVersion}/scip-clang-x86_64-linux`
const scipClangBinaryPath = path.join(graphBinaryDirectory, `scip-clang-${scipClangVersion}`)

const runCommandOrFail = (
  workspace: GraphWorkspaceInput,
  workingDirectory: string,
  phase: string,
  command: string,
  args: ReadonlyArray<string>
) =>
  Effect.gen(function* () {
    const commandRunner = yield* CommandRunner
    yield* commandRunner.runCommand(workingDirectory, command, args).pipe(
      Effect.mapError(mapWorkspaceError(workspace, phase, formatCommandError))
    )
  })

const canUseScipClangBinary = (workspace: GraphWorkspaceInput) =>
  Effect.gen(function* () {
    const fileStore = yield* FileStore
    const commandRunner = yield* CommandRunner
    const exists = yield* fileStore.fileExists(scipClangBinaryPath)
    if (!exists) {
      return false
    }

    const binarySize = yield* fileStore.readBytes(scipClangBinaryPath).pipe(
      Effect.map((content) => content.length),
      Effect.catchAll(() => Effect.succeed(0))
    )
    if (binarySize <= 100_000_000) {
      return false
    }

    return yield* commandRunner.runCommand(rootDirectory, scipClangBinaryPath, ["--help"]).pipe(
      Effect.as(true),
      Effect.catchAll(() => Effect.succeed(false))
    )
  })

const ensureScipClangBinary = (workspace: GraphWorkspaceInput) =>
  Effect.gen(function* () {
    const fileStore = yield* FileStore
    const isUsable = yield* canUseScipClangBinary(workspace)

    if (!isUsable) {
      const temporaryPath = `${scipClangBinaryPath}.download`

      yield* fileStore.makeDirectory(graphBinaryDirectory).pipe(
        Effect.mapError(mapWorkspaceError(workspace, "scip-clang-directory"))
      )
      yield* runCommandOrFail(
        workspace,
        rootDirectory,
        "scip-clang-download",
        "curl",
        ["-L", scipClangDownloadUrl, "-o", temporaryPath]
      )
      yield* runCommandOrFail(
        workspace,
        rootDirectory,
        "scip-clang-promote",
        "mv",
        [temporaryPath, scipClangBinaryPath]
      )
    }

    yield* runCommandOrFail(
      workspace,
      rootDirectory,
      "scip-clang-permissions",
      "chmod",
      ["+x", scipClangBinaryPath]
    )

    return scipClangBinaryPath
  })

export const clangBuildDirectory = (workspace: GraphWorkspaceInput) =>
  path.join(
    graphWorkspaceDirectory,
    safeCacheSegment(workspace.project_slug),
    safeCacheSegment(workspace.workspace_slug),
    "cmake-build"
  )

const configureCppWorkspace = (workspace: GraphWorkspaceInput) =>
  Effect.gen(function* () {
    const fileStore = yield* FileStore
    const buildDirectory = clangBuildDirectory(workspace)

    yield* fileStore.makeDirectory(buildDirectory).pipe(
      Effect.mapError(mapWorkspaceError(workspace, "cmake-directory"))
    )
    yield* runCommandOrFail(
      workspace,
      workspace.root_path,
      "cmake-configure",
      "cmake",
      ["-S", workspace.root_path, "-B", buildDirectory, "-DCMAKE_EXPORT_COMPILE_COMMANDS=ON"]
    )

    return path.join(buildDirectory, "compile_commands.json")
  })

export const prepareClangWorkspace = (workspace: GraphWorkspaceInput) =>
  Effect.gen(function* () {
    const binaryPath = yield* ensureScipClangBinary(workspace)
    const compilationDatabase = yield* configureCppWorkspace(workspace)

    return {
      binaryPath,
      compilationDatabase
    } as const
  })
