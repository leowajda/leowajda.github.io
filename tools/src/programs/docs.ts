import { Effect } from "effect"
import path from "node:path"
import { FileStore, FileStoreLive } from "../core/workspace.js"
import { rootDirectory } from "../core/paths.js"

const readmePath = path.join(rootDirectory, "README.md")
const agentsPath = path.join(rootDirectory, "AGENTS.md")

const program = Effect.gen(function* () {
  const fileStore = yield* FileStore
  const existing = yield* fileStore.readSymbolicLink(readmePath).pipe(
    Effect.map((value) => value === path.basename(agentsPath)),
    Effect.catchAll(() => Effect.succeed(false))
  )

  if (existing) {
    return
  }

  yield* fileStore.removePath(readmePath)
  yield* fileStore.createSymbolicLink(path.basename(agentsPath), readmePath)
})

export const refreshDocs = program.pipe(Effect.provide(FileStoreLive))
