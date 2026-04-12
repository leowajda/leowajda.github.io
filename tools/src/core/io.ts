import * as Command from "@effect/platform/Command"
import type * as CommandExecutor from "@effect/platform/CommandExecutor"
import * as FileSystem from "@effect/platform/FileSystem"
import type * as PlatformError from "@effect/platform/Error"
import { Effect } from "effect"
import path from "node:path"
import { CommandExecutionError, FileSystemError } from "./errors.js"

export type DirectoryEntry = {
  readonly name: string
  readonly isDirectory: () => boolean
  readonly isFile: () => boolean
}

const mapFileSystemError = (operation: string, target: string) => (error: PlatformError.PlatformError) =>
  new FileSystemError({
    operation,
    target,
    reason: error.message
  })

const mapCommandError = (command: string, workingDirectory: string) => (error: PlatformError.PlatformError) =>
  new CommandExecutionError({
    command,
    workingDirectory,
    reason: error.message
  })

const toDirectoryEntry = (name: string, type: FileSystem.File.Type): DirectoryEntry => ({
  name,
  isDirectory: () => type === "Directory",
  isFile: () => type === "File"
})

const makeParentDirectory = (fileSystem: FileSystem.FileSystem, targetPath: string) =>
  fileSystem.makeDirectory(path.dirname(targetPath), { recursive: true }).pipe(
    Effect.mapError(mapFileSystemError("makeDirectory", path.dirname(targetPath)))
  )

export const writeText = (fileSystem: FileSystem.FileSystem, filePath: string, content: string) =>
  makeParentDirectory(fileSystem, filePath).pipe(
    Effect.flatMap(() =>
      fileSystem.writeFileString(filePath, content).pipe(
        Effect.mapError(mapFileSystemError("writeText", filePath))
      )
    )
  )

export const writeBytes = (fileSystem: FileSystem.FileSystem, filePath: string, content: Uint8Array | Buffer) =>
  makeParentDirectory(fileSystem, filePath).pipe(
    Effect.flatMap(() =>
      fileSystem.writeFile(filePath, content).pipe(
        Effect.mapError(mapFileSystemError("writeBytes", filePath))
      )
    )
  )

export const readText = (fileSystem: FileSystem.FileSystem, filePath: string) =>
  fileSystem.readFileString(filePath).pipe(
    Effect.mapError(mapFileSystemError("readText", filePath))
  )

export const readBytes = (fileSystem: FileSystem.FileSystem, filePath: string) =>
  fileSystem.readFile(filePath).pipe(
    Effect.mapError(mapFileSystemError("readBytes", filePath))
  )

export const readSymbolicLink = (fileSystem: FileSystem.FileSystem, filePath: string) =>
  fileSystem.readLink(filePath).pipe(
    Effect.mapError(mapFileSystemError("readSymbolicLink", filePath))
  )

export const makeDirectory = (fileSystem: FileSystem.FileSystem, directory: string) =>
  fileSystem.makeDirectory(directory, { recursive: true }).pipe(
    Effect.mapError(mapFileSystemError("makeDirectory", directory))
  )

export const copyFile = (fileSystem: FileSystem.FileSystem, fromPath: string, toPath: string) =>
  makeParentDirectory(fileSystem, toPath).pipe(
    Effect.flatMap(() =>
      fileSystem.copyFile(fromPath, toPath).pipe(
        Effect.mapError(mapFileSystemError("copyFile", `${fromPath} -> ${toPath}`))
      )
    )
  )

export const removeDirectory = (fileSystem: FileSystem.FileSystem, directory: string) =>
  fileSystem.remove(directory, { recursive: true, force: true }).pipe(
    Effect.mapError(mapFileSystemError("removeDirectory", directory))
  )

export const removePath = (fileSystem: FileSystem.FileSystem, target: string) =>
  fileSystem.remove(target, { recursive: true, force: true }).pipe(
    Effect.mapError(mapFileSystemError("removePath", target))
  )

export const createSymbolicLink = (fileSystem: FileSystem.FileSystem, target: string, linkPath: string) =>
  fileSystem.symlink(target, linkPath).pipe(
    Effect.mapError(mapFileSystemError("createSymbolicLink", `${target} -> ${linkPath}`))
  )

export const readDirectory = (fileSystem: FileSystem.FileSystem, directory: string) =>
  fileSystem.readDirectory(directory).pipe(
    Effect.mapError(mapFileSystemError("readDirectory", directory)),
    Effect.flatMap((entries) =>
      Effect.forEach(entries, (entryName) =>
        fileSystem.stat(path.join(directory, entryName)).pipe(
          Effect.map((info) => toDirectoryEntry(entryName, info.type)),
          Effect.mapError(mapFileSystemError("readDirectory", directory))
        )
      , { concurrency: 8 })
    )
  )

export const fileExists = (fileSystem: FileSystem.FileSystem, filePath: string) =>
  fileSystem.exists(filePath).pipe(
    Effect.catchAll(() => Effect.succeed(false))
  )

export const copyDirectoryContents = (fileSystem: FileSystem.FileSystem, fromDirectory: string, toDirectory: string) =>
  fileSystem.copy(fromDirectory, toDirectory).pipe(
    Effect.mapError(mapFileSystemError("copyDirectoryContents", `${fromDirectory} -> ${toDirectory}`))
  )

export const runCommand = (
  executor: CommandExecutor.CommandExecutor,
  workingDirectory: string,
  command: string,
  args: ReadonlyArray<string>
) =>
  executor.string(
    Command.make(command, ...args).pipe(
      Command.workingDirectory(workingDirectory)
    )
  ).pipe(
    Effect.mapError(mapCommandError(`${command} ${args.join(" ")}`.trim(), workingDirectory))
  )

export const runGit = (
  executor: CommandExecutor.CommandExecutor,
  workingDirectory: string,
  ...args: ReadonlyArray<string>
) =>
  runCommand(executor, workingDirectory, "git", args).pipe(
    Effect.map((result) => result.trim()),
    Effect.mapError((error) =>
      new CommandExecutionError({
        command: `git ${args.join(" ")}`,
        workingDirectory,
        reason: error.reason
      })
    )
  )
