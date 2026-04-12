import { Effect } from "effect"
import path from "node:path"
import { FileStore } from "../../core/workspace.js"
import type { ProjectManifest } from "../schema.js"

export type SourceRoot = {
  readonly language: "java" | "scala"
  readonly label: "src/main/java" | "src/main/scala"
  readonly absolutePath: string
}

export type ModuleCandidate = {
  readonly slug: string
  readonly title: string
  readonly absolutePath: string
  readonly relativePath: string
  readonly roots: ReadonlyArray<SourceRoot>
}

const supportedSourceRoots = [
  { language: "java", label: "src/main/java" },
  { language: "scala", label: "src/main/scala" }
] as const

const ignoredDirectoryNames = new Set([".git", ".idea", ".bsp", "build", "dist", "node_modules", "out", "target"])

export const slugifyModuleName = (value: string) =>
  value
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[_\s]+/g, "-")
    .replace(/[^a-zA-Z0-9-]/g, "-")
    .toLowerCase()
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")

export const titleizeModuleName = (value: string) =>
  value
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")

const detectModuleRoots = (absolutePath: string) =>
  Effect.gen(function* () {
    const fileStore = yield* FileStore
    const roots = yield* Effect.forEach(supportedSourceRoots, (root) =>
      fileStore.fileExists(path.join(absolutePath, root.label)).pipe(
        Effect.map((exists) =>
          exists
            ? ({
                language: root.language,
                label: root.label,
                absolutePath: path.join(absolutePath, root.label)
              } as SourceRoot)
            : null
        )
      )
    )

    return roots.filter((root): root is SourceRoot => root !== null)
  })

export const discoverModuleCandidates = (manifest: ProjectManifest, repoRoot: string) =>
  Effect.gen(function* () {
    const fileStore = yield* FileStore
    const rootCandidate = {
      slug: "root",
      title: `${manifest.title} Source`,
      absolutePath: repoRoot,
      relativePath: "",
      roots: yield* detectModuleRoots(repoRoot)
    } satisfies ModuleCandidate

    const entries = yield* fileStore.readDirectory(repoRoot)
    const childCandidates = yield* Effect.forEach(
      entries.filter((entry) => entry.isDirectory() && !entry.name.startsWith(".") && !ignoredDirectoryNames.has(entry.name)),
      (entry) =>
        detectModuleRoots(path.join(repoRoot, entry.name)).pipe(
          Effect.map((roots) => ({
            slug: slugifyModuleName(entry.name),
            title: titleizeModuleName(entry.name),
            absolutePath: path.join(repoRoot, entry.name),
            relativePath: entry.name,
            roots
          } satisfies ModuleCandidate))
        )
    )

    const displayableChildren = childCandidates.filter((candidate) => candidate.roots.length > 0)
    if (displayableChildren.length > 0) {
      return displayableChildren
    }

    return rootCandidate.roots.length > 0 ? [rootCandidate] : []
  })

export const walkTextFiles = (
  directory: string,
  supportedExtensions: ReadonlySet<string>
): Effect.Effect<ReadonlyArray<string>, Error, FileStore> =>
  Effect.gen(function* () {
    const fileStore = yield* FileStore
    const entries = yield* fileStore.readDirectory(directory)
    const nested = yield* Effect.forEach(entries, (entry) => {
      const fullPath = path.join(directory, entry.name)
      if (entry.isDirectory()) {
        if (entry.name.startsWith(".") || ignoredDirectoryNames.has(entry.name)) {
          return Effect.succeed([] as ReadonlyArray<string>)
        }

        return walkTextFiles(fullPath, supportedExtensions)
      }

      const extension = path.extname(entry.name).toLowerCase()
      return Effect.succeed(supportedExtensions.has(extension) ? [fullPath] : [])
    }, { concurrency: 8 })

    return nested.flat()
  })
