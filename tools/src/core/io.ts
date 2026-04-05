import { Effect } from "effect"
import { execFile } from "node:child_process"
import fs from "node:fs/promises"
import path from "node:path"
import { promisify } from "node:util"

const execFileAsync = promisify(execFile)

const attempt = <T>(label: string, operation: () => Promise<T>) =>
  Effect.tryPromise({
    try: operation,
    catch: (error) => new Error(`${label}: ${String(error)}`)
  })

export const writeText = (filePath: string, content: string) =>
  attempt(`Unable to write ${filePath}`, async () => {
      await fs.mkdir(path.dirname(filePath), { recursive: true })
      await fs.writeFile(filePath, content, "utf8")
  })

export const readText = (filePath: string) =>
  attempt(`Unable to read ${filePath}`, () => fs.readFile(filePath, "utf8"))

export const copyFile = (fromPath: string, toPath: string) =>
  attempt(`Unable to copy ${fromPath} -> ${toPath}`, async () => {
      await fs.mkdir(path.dirname(toPath), { recursive: true })
      await fs.copyFile(fromPath, toPath)
  })

export const removeDirectory = (directory: string) =>
  attempt(`Unable to remove ${directory}`, () => fs.rm(directory, { recursive: true, force: true }))

export const readDirectory = (directory: string) =>
  attempt(`Unable to read directory ${directory}`, () => fs.readdir(directory, { withFileTypes: true }))

export const fileExists = (filePath: string) =>
  Effect.promise(() => fs.access(filePath).then(() => true).catch(() => false))

export const copyDirectoryContents = (fromDirectory: string, toDirectory: string): Effect.Effect<void, Error> =>
  attempt(`Unable to copy directory ${fromDirectory} -> ${toDirectory}`, () =>
    fs.cp(fromDirectory, toDirectory, { recursive: true })
  )

export const runGit = (workingDirectory: string, ...args: ReadonlyArray<string>) =>
  attempt(`git ${args.join(" ")} failed in ${workingDirectory}`, async () => {
      const { stdout } = await execFileAsync("git", [...args], { cwd: workingDirectory })
      return stdout.trim()
  })
