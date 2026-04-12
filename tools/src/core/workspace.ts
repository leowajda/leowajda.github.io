import * as CommandExecutor from "@effect/platform/CommandExecutor"
import * as FileSystem from "@effect/platform/FileSystem"
import { Context, Effect, Layer } from "effect"
import {
  copyFile,
  copyDirectoryContents,
  createSymbolicLink,
  type DirectoryEntry,
  fileExists,
  makeDirectory,
  readBytes,
  readDirectory,
  readSymbolicLink,
  readText,
  removePath,
  removeDirectory,
  runCommand,
  runGit,
  writeBytes,
  writeText
} from "./io.js"

export interface FileStoreService {
  readonly readDirectory: (directory: string) => Effect.Effect<ReadonlyArray<DirectoryEntry>, Error>
  readonly readText: (filePath: string) => Effect.Effect<string, Error>
  readonly readBytes: (filePath: string) => Effect.Effect<Uint8Array, Error>
  readonly writeBytes: (filePath: string, content: Uint8Array | Buffer) => Effect.Effect<void, Error>
  readonly writeText: (filePath: string, content: string) => Effect.Effect<void, Error>
  readonly makeDirectory: (directory: string) => Effect.Effect<void, Error>
  readonly copyFile: (fromPath: string, toPath: string) => Effect.Effect<void, Error>
  readonly removeDirectory: (directory: string) => Effect.Effect<void, Error>
  readonly removePath: (target: string) => Effect.Effect<void, Error>
  readonly readSymbolicLink: (filePath: string) => Effect.Effect<string, Error>
  readonly createSymbolicLink: (target: string, linkPath: string) => Effect.Effect<void, Error>
  readonly copyDirectoryContents: (fromDirectory: string, toDirectory: string) => Effect.Effect<void, Error>
  readonly fileExists: (filePath: string) => Effect.Effect<boolean, never>
}

export interface GitService {
  readonly runGit: (workingDirectory: string, ...args: ReadonlyArray<string>) => Effect.Effect<string, Error>
  readonly updateSubmodules: (workingDirectory: string) => Effect.Effect<string, Error>
}

export interface CommandService {
  readonly runCommand: (workingDirectory: string, command: string, args: ReadonlyArray<string>) => Effect.Effect<string, Error>
}

export class FileStore extends Context.Tag("FileStore")<FileStore, FileStoreService>() {}
export class GitClient extends Context.Tag("GitClient")<GitClient, GitService>() {}
export class CommandRunner extends Context.Tag("CommandRunner")<CommandRunner, CommandService>() {}

export type { DirectoryEntry }

export const FileStoreLive = Layer.effect(FileStore, Effect.gen(function* () {
  const fileSystem = yield* FileSystem.FileSystem

  return {
    readDirectory: (directory: string) => readDirectory(fileSystem, directory),
    readText: (filePath: string) => readText(fileSystem, filePath),
    readBytes: (filePath: string) => readBytes(fileSystem, filePath),
    writeBytes: (filePath: string, content: Uint8Array | Buffer) => writeBytes(fileSystem, filePath, content),
    writeText: (filePath: string, content: string) => writeText(fileSystem, filePath, content),
    makeDirectory: (directory: string) => makeDirectory(fileSystem, directory),
    copyFile: (fromPath: string, toPath: string) => copyFile(fileSystem, fromPath, toPath),
    removeDirectory: (directory: string) => removeDirectory(fileSystem, directory),
    removePath: (target: string) => removePath(fileSystem, target),
    readSymbolicLink: (filePath: string) => readSymbolicLink(fileSystem, filePath),
    createSymbolicLink: (target: string, linkPath: string) => createSymbolicLink(fileSystem, target, linkPath),
    copyDirectoryContents: (fromDirectory: string, toDirectory: string) => copyDirectoryContents(fileSystem, fromDirectory, toDirectory),
    fileExists: (filePath: string) => fileExists(fileSystem, filePath)
  } satisfies FileStoreService
}))

export const GitClientLive = Layer.effect(GitClient, Effect.gen(function* () {
  const executor = yield* CommandExecutor.CommandExecutor

  return {
    runGit: (workingDirectory: string, ...args: ReadonlyArray<string>) => runGit(executor, workingDirectory, ...args),
    updateSubmodules: (workingDirectory: string) =>
      runGit(executor, workingDirectory, "submodule", "sync", "--recursive").pipe(
        Effect.flatMap(() => runGit(executor, workingDirectory, "submodule", "update", "--init", "--recursive", "--remote"))
      )
  } satisfies GitService
}))

export const CommandRunnerLive = Layer.effect(CommandRunner, Effect.gen(function* () {
  const executor = yield* CommandExecutor.CommandExecutor

  return {
    runCommand: (workingDirectory: string, command: string, args: ReadonlyArray<string>) =>
      runCommand(executor, workingDirectory, command, args)
  } satisfies CommandService
}))

export const WorkspaceLive = Layer.mergeAll(FileStoreLive, GitClientLive, CommandRunnerLive)
