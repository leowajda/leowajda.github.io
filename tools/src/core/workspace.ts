import { Context, Layer } from "effect"
import {
  copyDirectoryContents,
  fileExists,
  readDirectory,
  readText,
  removeDirectory,
  runGit,
  writeText
} from "./io.js"

export interface WorkspaceService {
  readonly readDirectory: typeof readDirectory
  readonly readText: typeof readText
  readonly writeText: typeof writeText
  readonly removeDirectory: typeof removeDirectory
  readonly copyDirectoryContents: typeof copyDirectoryContents
  readonly fileExists: typeof fileExists
  readonly runGit: typeof runGit
}

export class Workspace extends Context.Tag("Workspace")<Workspace, WorkspaceService>() {}

export const WorkspaceLive = Layer.succeed(Workspace, {
  readDirectory,
  readText,
  writeText,
  removeDirectory,
  copyDirectoryContents,
  fileExists,
  runGit
})
