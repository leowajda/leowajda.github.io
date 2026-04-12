import { Effect } from "effect"
import path from "node:path"
import type { CodeGraphError } from "../core/errors.js"
import { rootDirectory } from "../core/paths.js"
import { CommandRunner, FileStore } from "../core/workspace.js"
import { prepareClangWorkspace } from "./clang.js"
import { codeGraphError, formatCommandError, mapWorkspaceError } from "./errors.js"
import { resolveCompatibleJavaHome } from "./java-runtime.js"
import type { GraphWorkspaceInput } from "./model.js"

const scipJavaArtifact = "com.sourcegraph:scip-java_2.13:0.12.3"
const scipPythonCommand = ["pnpm", "exec", "scip-python"] as const

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
        const { binaryPath, compilationDatabase } = yield* prepareClangWorkspace(workspace)
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
