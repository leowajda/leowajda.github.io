import { Effect } from "effect"
import { execFile } from "node:child_process"
import fs from "node:fs/promises"
import path from "node:path"
import { promisify } from "node:util"
import { CommandExecutionError, FileSystemError } from "./errors.js"

const execFileAsync = promisify(execFile)

const attemptFileSystem = <T>(operation: string, target: string, task: () => Promise<T>) =>
  Effect.tryPromise({
    try: task,
    catch: (error) => new FileSystemError({ operation, target, reason: String(error) })
  })

export const writeText = (filePath: string, content: string) =>
  attemptFileSystem("writeText", filePath, async () => {
      await fs.mkdir(path.dirname(filePath), { recursive: true })
      await fs.writeFile(filePath, content, "utf8")
  })

export const writeBytes = (filePath: string, content: Uint8Array | Buffer) =>
  attemptFileSystem("writeBytes", filePath, async () => {
      await fs.mkdir(path.dirname(filePath), { recursive: true })
      await fs.writeFile(filePath, content)
  })

export const readText = (filePath: string) =>
  attemptFileSystem("readText", filePath, () => fs.readFile(filePath, "utf8"))

export const readBytes = (filePath: string) =>
  attemptFileSystem("readBytes", filePath, () => fs.readFile(filePath))

export const readSymbolicLink = (filePath: string) =>
  attemptFileSystem("readSymbolicLink", filePath, () => fs.readlink(filePath))

export const makeDirectory = (directory: string) =>
  attemptFileSystem("makeDirectory", directory, () => fs.mkdir(directory, { recursive: true }))

export const copyFile = (fromPath: string, toPath: string) =>
  attemptFileSystem("copyFile", `${fromPath} -> ${toPath}`, async () => {
    await fs.mkdir(path.dirname(toPath), { recursive: true })
    await fs.copyFile(fromPath, toPath)
  })

export const removeDirectory = (directory: string) =>
  attemptFileSystem("removeDirectory", directory, () => fs.rm(directory, { recursive: true, force: true }))

export const removePath = (target: string) =>
  attemptFileSystem("removePath", target, () => fs.rm(target, { recursive: true, force: true }))

export const createSymbolicLink = (target: string, linkPath: string) =>
  attemptFileSystem("createSymbolicLink", `${target} -> ${linkPath}`, () =>
    fs.symlink(target, linkPath)
  )

export const readDirectory = (directory: string) =>
  attemptFileSystem("readDirectory", directory, () => fs.readdir(directory, { withFileTypes: true }))

export const fileExists = (filePath: string) =>
  Effect.promise(() => fs.access(filePath).then(() => true).catch(() => false))

export const copyDirectoryContents = (fromDirectory: string, toDirectory: string): Effect.Effect<void, Error> =>
  attemptFileSystem("copyDirectoryContents", `${fromDirectory} -> ${toDirectory}`, () =>
    fs.cp(fromDirectory, toDirectory, { recursive: true })
  )

export const runGit = (workingDirectory: string, ...args: ReadonlyArray<string>) =>
  runCommand(workingDirectory, "git", args).pipe(
    Effect.map((result) => result.trim()),
    Effect.mapError((error) =>
      error instanceof CommandExecutionError
        ? new CommandExecutionError({
            command: `git ${args.join(" ")}`,
            workingDirectory,
            reason: error.reason
          })
        : error
    )
  )

export const runCommand = (workingDirectory: string, command: string, args: ReadonlyArray<string>) =>
  Effect.tryPromise({
    try: async () => {
      const { stdout } = await execFileAsync(command, [...args], {
        cwd: workingDirectory,
        maxBuffer: 1024 * 1024 * 32
      })
      return stdout
    },
    catch: (error) => new CommandExecutionError({
      command: `${command} ${args.join(" ")}`.trim(),
      workingDirectory,
      reason: String(error)
    })
  })
