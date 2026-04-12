import { Effect } from "effect"
import path from "node:path"
import type { CodeGraphError } from "../core/errors.js"
import { rootDirectory } from "../core/paths.js"
import { CommandRunner, FileStore } from "../core/workspace.js"
import { graphBinaryDirectory, graphWorkspaceDirectory, safeCacheSegment } from "./cache.js"
import { codeGraphError, formatCommandError, mapWorkspaceError } from "./errors.js"
import type { GraphWorkspaceInput } from "./model.js"

const scipJavaArtifact = "com.sourcegraph:scip-java_2.13:0.12.3"
const scipPythonCommand = ["pnpm", "exec", "scip-python"] as const
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

const unique = <A>(values: ReadonlyArray<A>) =>
  Array.from(new Set(values))

const compareJavaCandidateNames = (left: string, right: string) => {
  const rank = (value: string) => {
    const numericPrefix = Number.parseInt(value, 10)
    if (Number.isNaN(numericPrefix)) {
      return value === "current" ? 0 : -1
    }

    if (numericPrefix === 21) {
      return 700
    }

    if (numericPrefix >= 17 && numericPrefix < 21) {
      return 600 + numericPrefix
    }

    if (numericPrefix < 17) {
      return 200 + numericPrefix
    }

    return 500 - Math.min(numericPrefix, 99)
  }

  return rank(right) - rank(left)
}

const resolveCompatibleJavaHome = (workspace: GraphWorkspaceInput) =>
  Effect.gen(function* () {
    const fileStore = yield* FileStore
    const commandRunner = yield* CommandRunner
    const sdkmanJavaDirectory = process.env.HOME
      ? path.join(process.env.HOME, ".sdkman", "candidates", "java")
      : null
    const sdkmanCandidates = sdkmanJavaDirectory
      ? yield* fileStore.readDirectory(sdkmanJavaDirectory).pipe(
          Effect.map((entries) =>
            entries
              .filter((entry) => entry.isDirectory() && entry.name !== "current")
              .map((entry) => path.join(sdkmanJavaDirectory, entry.name))
              .sort((left, right) => compareJavaCandidateNames(path.basename(left), path.basename(right)))
          ),
          Effect.catchAll(() => Effect.succeed([] as ReadonlyArray<string>))
        )
      : []
    const candidates = unique([
      process.env.JAVA21_HOME,
      process.env.JDK21_HOME,
      process.env.JAVA17_HOME,
      process.env.JDK17_HOME,
      ...sdkmanCandidates,
      "/usr/lib/jvm/java-21-openjdk-amd64",
      "/usr/lib/jvm/java-1.21.0-openjdk-amd64",
      process.env.JDK_HOME,
      process.env.JAVA_HOME,
      process.env.HOME ? path.join(process.env.HOME, ".sdkman", "candidates", "java", "current") : null
    ].filter((candidate): candidate is string => Boolean(candidate)))

    for (const candidate of candidates) {
      const javacExecutable = path.join(candidate, "bin", "javac")
      const javaExecutable = path.join(candidate, "bin", "java")
      const [javaExists, javacExists] = yield* Effect.all([
        fileStore.fileExists(javaExecutable),
        fileStore.fileExists(javacExecutable)
      ])

      if (javaExists && javacExists) {
        return candidate
      }
    }

    const coursierJavaHome = yield* commandRunner.runCommand(rootDirectory, "cs", ["java-home", "--jvm", "temurin:21"]).pipe(
      Effect.map((output) => output.trim()),
      Effect.catchAll(() => Effect.succeed(""))
    )
    if (coursierJavaHome) {
      const javacExecutable = path.join(coursierJavaHome, "bin", "javac")
      const javaExecutable = path.join(coursierJavaHome, "bin", "java")
      const [javaExists, javacExists] = yield* Effect.all([
        fileStore.fileExists(javaExecutable),
        fileStore.fileExists(javacExecutable)
      ])

      if (javaExists && javacExists) {
        return coursierJavaHome
      }
    }

    return yield* Effect.fail(codeGraphError(workspace, "java-runtime", "Unable to resolve a compiler-capable JDK for scip-java"))
  })

const ensureScipClangBinary = (workspace: GraphWorkspaceInput) =>
  Effect.gen(function* () {
    const fileStore = yield* FileStore
    const commandRunner = yield* CommandRunner
    const exists = yield* fileStore.fileExists(scipClangBinaryPath)
    const binarySize = exists
      ? yield* fileStore.readBytes(scipClangBinaryPath).pipe(
          Effect.map((content) => content.length),
          Effect.catchAll(() => Effect.succeed(0))
        )
      : 0
    const isUsable = exists && binarySize > 100_000_000
      ? yield* commandRunner.runCommand(rootDirectory, scipClangBinaryPath, ["--help"]).pipe(
          Effect.as(true),
          Effect.catchAll(() => Effect.succeed(false))
        )
      : false

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

const configureCppWorkspace = (workspace: GraphWorkspaceInput) =>
  Effect.gen(function* () {
    const fileStore = yield* FileStore
    const buildDirectory = path.join(
      graphWorkspaceDirectory,
      safeCacheSegment(workspace.project_slug),
      safeCacheSegment(workspace.workspace_slug),
      "cmake-build"
    )

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

export const runWorkspaceIndexer = (
  workspace: GraphWorkspaceInput,
  outputPath: string
): Effect.Effect<void, CodeGraphError, FileStore | CommandRunner> =>
  Effect.gen(function* () {
    const fileStore = yield* FileStore
    yield* fileStore.makeDirectory(path.dirname(outputPath)).pipe(
      Effect.mapError(mapWorkspaceError(workspace, "index-output-directory"))
    )

    switch (workspace.kind) {
      case "scip-java": {
        const javaHome = yield* resolveCompatibleJavaHome(workspace)
        yield* runCommandOrFail(
          workspace,
          workspace.root_path,
          "scip-java-index",
          "env",
          [
            `JAVA_HOME=${javaHome}`,
            `PATH=${path.join(javaHome, "bin")}:${process.env.PATH ?? ""}`,
            "cs",
            "launch",
            scipJavaArtifact,
            "-M",
            "com.sourcegraph.scip_java.ScipJava",
            "--",
            "index",
            "--output",
            outputPath
          ]
        )
        return
      }
      case "scip-python":
        yield* runCommandOrFail(
          workspace,
          rootDirectory,
          "scip-python-index",
          scipPythonCommand[0],
          [
            scipPythonCommand[1],
            scipPythonCommand[2],
            "index",
            "--cwd",
            workspace.root_path,
            "--project-name",
            workspace.workspace_slug,
            "--output",
            outputPath
          ]
        )
        return
      case "scip-clang": {
        const binaryPath = yield* ensureScipClangBinary(workspace)
        const compilationDatabase = yield* configureCppWorkspace(workspace)
        yield* runCommandOrFail(
          workspace,
          workspace.root_path,
          "scip-clang-index",
          binaryPath,
          [
            `--compdb-path=${compilationDatabase}`,
            `--index-output-path=${outputPath}`
          ]
        )
        return
      }
    }
  })
