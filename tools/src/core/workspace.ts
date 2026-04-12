import { Context, Effect, Layer } from "effect"
import {
  copyFile,
  copyDirectoryContents,
  fileExists,
  makeDirectory,
  readBytes,
  readDirectory,
  readText,
  removeDirectory,
  runCommand,
  runGit,
  writeBytes,
  writeText
} from "./io.js"

export interface FileStoreService {
  readonly readDirectory: typeof readDirectory
  readonly readText: typeof readText
  readonly readBytes: typeof readBytes
  readonly writeBytes: typeof writeBytes
  readonly writeText: typeof writeText
  readonly makeDirectory: typeof makeDirectory
  readonly copyFile: typeof copyFile
  readonly removeDirectory: typeof removeDirectory
  readonly copyDirectoryContents: typeof copyDirectoryContents
  readonly fileExists: typeof fileExists
}

export interface GitService {
  readonly runGit: typeof runGit
  readonly updateSubmodules: (workingDirectory: string) => Effect.Effect<string, Error>
}

export interface CommandService {
  readonly runCommand: typeof runCommand
}

export class FileStore extends Context.Tag("FileStore")<FileStore, FileStoreService>() {}
export class GitClient extends Context.Tag("GitClient")<GitClient, GitService>() {}
export class CommandRunner extends Context.Tag("CommandRunner")<CommandRunner, CommandService>() {}

export const FileStoreLive = Layer.succeed(FileStore, {
  readDirectory,
  readText,
  readBytes,
  writeBytes,
  writeText,
  makeDirectory,
  copyFile,
  removeDirectory,
  copyDirectoryContents,
  fileExists
})

export const GitClientLive = Layer.succeed(GitClient, {
  runGit,
  updateSubmodules: (workingDirectory: string) =>
    runGit(workingDirectory, "submodule", "sync", "--recursive").pipe(
      Effect.flatMap(() => runGit(workingDirectory, "submodule", "update", "--init", "--recursive", "--remote"))
    )
})

export const CommandRunnerLive = Layer.succeed(CommandRunner, {
  runCommand
})

export const WorkspaceLive = Layer.mergeAll(FileStoreLive, GitClientLive, CommandRunnerLive)
