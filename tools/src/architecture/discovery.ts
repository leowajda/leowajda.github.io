import { Effect } from "effect"
import path from "node:path"
import { ArchitectureDiscoveryError, ProjectManifestError } from "../core/errors.js"
import { projectsDirectory, rootDirectory } from "../core/paths.js"
import { decodeYaml } from "../core/yaml.js"
import type { FileStoreService } from "../core/workspace.js"
import { FileStore, WorkspaceLive } from "../core/workspace.js"
import { ProjectManifestSchema, type ProjectManifest } from "../projects/schema.js"
import { ArchitectureSettings, type ArchitectureSettingsData } from "./settings.js"

export type DiscoveredFile = {
  readonly absolutePath: string
  readonly relativePath: string
}

export type DiscoveredImport = {
  readonly fromPath: string
  readonly toPath: string
}

export type DiscoveredFacts = {
  readonly files: ReadonlyArray<DiscoveredFile>
  readonly imports: ReadonlyArray<DiscoveredImport>
}

const relativeImportPattern = /from\s+["'](\.[^"']+)["']|import\s*\(["'](\.[^"']+)["']\)/g

const dedupeBy = <A>(values: ReadonlyArray<A>, keyOf: (value: A) => string): ReadonlyArray<A> =>
  Array.from(new Map(values.map((value) => [keyOf(value), value])).values())

const pathExists = (value: string) =>
  Effect.promise(async () => {
    const fs = await import("node:fs/promises")
    try {
      await fs.access(value)
      return true
    } catch {
      return false
    }
  })

const readTree = (
  fileStore: FileStoreService,
  trackedExtensions: ReadonlySet<string>,
  directory: string
): Effect.Effect<ReadonlyArray<DiscoveredFile>, ArchitectureDiscoveryError> =>
  Effect.gen(function* () {
    const entries = yield* fileStore.readDirectory(directory).pipe(
      Effect.mapError((error) => new ArchitectureDiscoveryError({ phase: "scan", reason: String(error) }))
    )
    const nested = yield* Effect.forEach(entries, (entry) => {
      const absolutePath = path.join(directory, entry.name)
      if (entry.isDirectory()) {
        return readTree(fileStore, trackedExtensions, absolutePath)
      }

      return trackedExtensions.has(path.extname(entry.name))
        ? Effect.succeed([{ absolutePath, relativePath: path.relative(rootDirectory, absolutePath) }] as const)
        : Effect.succeed([] as const)
    }, { concurrency: 8 })

    return nested.flat()
  })

const loadProjectManifests = (fileStore: FileStoreService) => Effect.gen(function* () {
  const entries = yield* fileStore.readDirectory(projectsDirectory).pipe(
    Effect.mapError((error) => new ProjectManifestError({ file: "projects", reason: String(error) }))
  )
  const manifestFiles = entries.filter((entry) => entry.isFile() && entry.name.endsWith(".yml"))

  return yield* Effect.forEach(manifestFiles, (entry) =>
    fileStore.readText(path.join(projectsDirectory, entry.name)).pipe(
      Effect.flatMap((content) => decodeYaml(entry.name, content, ProjectManifestSchema)),
      Effect.mapError((error) => new ProjectManifestError({ file: entry.name, reason: String(error) }))
    )
  )
})

const resolveImportTarget = async (fromPath: string, specifier: string): Promise<string | null> => {
  const fs = await import("node:fs/promises")
  const basePath = path.resolve(path.dirname(path.join(rootDirectory, fromPath)), specifier)
  const candidates = [
    basePath,
    `${basePath}.ts`,
    `${basePath}.tsx`,
    `${basePath}.js`,
    `${basePath}.jsx`,
    `${basePath}.scss`,
    `${basePath}.css`,
    `${basePath}.html`,
    path.join(basePath, "index.ts"),
    path.join(basePath, "index.tsx"),
    path.join(basePath, "index.js")
  ]

  for (const candidate of candidates) {
    try {
      const stats = await fs.stat(candidate)
      if (stats.isFile()) {
        return path.relative(rootDirectory, candidate)
      }
    } catch {
      continue
    }
  }

  return null
}

const scanArchitectureFiles = (
  fileStore: FileStoreService,
  settings: ArchitectureSettingsData
) => Effect.gen(function* () {
  const trackedExtensions = new Set(settings.trackedExtensions)
  const discoveredTrees = yield* Effect.forEach(settings.architectureRoots, (relativePath) => {
    const absolutePath = path.join(rootDirectory, relativePath)
    return pathExists(absolutePath).pipe(
      Effect.flatMap((exists) => exists ? readTree(fileStore, trackedExtensions, absolutePath) : Effect.succeed([]))
    )
  }, { concurrency: settings.rootScanConcurrency })

  return discoveredTrees.flat()
})

const extractRelativeImports = (
  fileStore: FileStoreService,
  settings: ArchitectureSettingsData,
  files: ReadonlyArray<DiscoveredFile>
) =>
  Effect.gen(function* () {
    const knownFiles = new Set(files.map((file) => file.relativePath))
    const imports = yield* Effect.forEach(files, (file) =>
      fileStore.readText(file.absolutePath).pipe(
        Effect.mapError((error) => new ArchitectureDiscoveryError({ phase: "imports", reason: String(error) })),
        Effect.flatMap((content) =>
          Effect.tryPromise({
            try: async () => {
              const specifiers = Array.from(content.matchAll(relativeImportPattern))
                .map((match) => match[1] ?? match[2])
                .filter((value): value is string => Boolean(value))
              const targets = await Promise.all(specifiers.map((specifier) => resolveImportTarget(file.relativePath, specifier)))

              return targets
                .filter((target): target is string => typeof target === "string")
                .filter((target) => knownFiles.has(target))
                .map((target) => ({ fromPath: file.relativePath, toPath: target }))
            },
            catch: (error) => new ArchitectureDiscoveryError({ phase: "imports", reason: String(error) })
          })
        )
      ),
    { concurrency: settings.scanConcurrency })

    return dedupeBy(imports.flat(), (entry) => `${entry.fromPath}:${entry.toPath}`)
  })

export class ProjectManifestRepository extends Effect.Service<ProjectManifestRepository>()("ProjectManifestRepository", {
  effect: Effect.gen(function* () {
    const fileStore = yield* FileStore
    const cachedLoadAll = yield* Effect.cached(
      loadProjectManifests(fileStore).pipe(
        Effect.withLogSpan("architecture.project-manifests.load"),
        Effect.annotateLogs({ component: "project-manifests" })
      )
    )
    return {
      loadAll: () => cachedLoadAll
    }
  }),
  dependencies: [WorkspaceLive],
  accessors: true
}) {}

export class ArchitectureDiscovery extends Effect.Service<ArchitectureDiscovery>()("ArchitectureDiscovery", {
  effect: Effect.gen(function* () {
    const fileStore = yield* FileStore
    const settings = yield* ArchitectureSettings
    return {
      discover: () =>
        Effect.gen(function* () {
          const files = yield* scanArchitectureFiles(fileStore, settings)
          const imports = yield* extractRelativeImports(fileStore, settings, files)
          return { files, imports }
        }).pipe(
          Effect.withLogSpan("architecture.discovery"),
          Effect.annotateLogs({ component: "architecture-discovery" })
        )
    }
  }),
  dependencies: [WorkspaceLive, ArchitectureSettings.Default],
  accessors: true
}) {}
