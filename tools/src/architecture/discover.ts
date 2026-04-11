import { Effect } from "effect"
import path from "node:path"
import { ArchitectureDiscoveryError } from "../core/errors.js"
import { rootDirectory, projectsDirectory } from "../core/paths.js"
import { decodeYaml } from "../core/yaml.js"
import { FileStore } from "../core/workspace.js"
import { ProjectManifestSchema, type ProjectManifest } from "../projects/schema.js"
import type { ArchitectureEdge, ArchitectureGraph, ArchitectureNode } from "./schema.js"

type DiscoveredFile = {
  readonly absolutePath: string
  readonly relativePath: string
}

const architectureRoots = [
  "tools/src",
  "packages/ui/src",
  "packages/theme/src",
  "site-src"
] as const

const architectureExtensions = new Set([".ts", ".tsx", ".js", ".jsx", ".scss", ".css", ".html", ".md", ".yml"])

const pathExists = (value: string) => Effect.tryPromise({
  try: async () => {
    const fs = await import("node:fs/promises")
    await fs.access(value)
    return true
  },
  catch: () => false
})

const readTree = (directory: string): Effect.Effect<ReadonlyArray<DiscoveredFile>, Error, FileStore> =>
  Effect.gen(function* () {
    const fileStore = yield* FileStore
    const entries = yield* fileStore.readDirectory(directory)
    const nested = yield* Effect.forEach(entries, (entry) => {
      const absolutePath = path.join(directory, entry.name)
      if (entry.isDirectory()) {
        return readTree(absolutePath)
      }

      return architectureExtensions.has(path.extname(entry.name))
        ? Effect.succeed([{ absolutePath, relativePath: path.relative(rootDirectory, absolutePath) }] as const)
        : Effect.succeed([] as const)
    }, { concurrency: 8 })

    return nested.flat()
  })

const loadProjectManifests = Effect.gen(function* () {
  const fileStore = yield* FileStore
  const entries = yield* fileStore.readDirectory(projectsDirectory)
  const manifestFiles = entries.filter((entry) => entry.isFile() && entry.name.endsWith(".yml"))

  return yield* Effect.forEach(manifestFiles, (entry) =>
    fileStore.readText(path.join(projectsDirectory, entry.name)).pipe(
      Effect.flatMap((content) => decodeYaml(`Unable to decode project manifest '${entry.name}'`, content, ProjectManifestSchema))
    )
  )
})

const relativeImportPattern = /from\s+["'](\.[^"']+)["']|import\s*\(["'](\.[^"']+)["']\)/g

const toModuleId = (relativePath: string): string => {
  if (relativePath === "tools/src/main.ts") {
    return "cli"
  }
  if (relativePath.startsWith("tools/src/core/")) {
    return "tools-core"
  }
  if (relativePath.startsWith("tools/src/architecture/")) {
    return "tools-architecture"
  }
  if (relativePath.startsWith("tools/src/programs/")) {
    return "tools-programs"
  }
  if (relativePath.startsWith("tools/src/projects/")) {
    const parts = relativePath.split("/")
    return parts.length >= 5 ? `project-${parts[3]}` : "tools-projects"
  }
  if (relativePath.startsWith("packages/ui/")) {
    return "package-ui"
  }
  if (relativePath.startsWith("packages/theme/")) {
    return "package-theme"
  }
  if (relativePath.startsWith("site-src/")) {
    return "site-src"
  }
  return "misc"
}

const moduleLabel = (moduleId: string, manifests: ReadonlyArray<ProjectManifest>): string => {
  if (moduleId === "cli") return "CLI"
  if (moduleId === "tools-core") return "tools/core"
  if (moduleId === "tools-architecture") return "tools/architecture"
  if (moduleId === "tools-programs") return "tools/programs"
  if (moduleId === "tools-projects") return "tools/projects"
  if (moduleId === "package-ui") return "packages/ui"
  if (moduleId === "package-theme") return "packages/theme"
  if (moduleId === "site-src") return "site-src"
  if (moduleId.startsWith("project-")) {
    const slug = moduleId.replace(/^project-/, "")
    const manifest = manifests.find((entry) => entry.slug === slug || entry.kind === slug)
    return manifest ? `project:${manifest.slug}` : moduleId
  }
  if (moduleId.startsWith("manifest-")) return moduleId.replace(/^manifest-/, "")
  if (moduleId.startsWith("source-")) return moduleId.replace(/^source-/, "")
  return moduleId
}

const moduleGroup = (moduleId: string): string => {
  if (moduleId === "cli" || moduleId.startsWith("tools-") || moduleId.startsWith("project-")) return "Tools"
  if (moduleId.startsWith("manifest-")) return "Project Manifests"
  if (moduleId.startsWith("source-")) return "Source Repos"
  if (moduleId === "package-ui" || moduleId === "package-theme") return "Packages"
  if (moduleId === "site-src" || moduleId === "generated-site" || moduleId === "rendered-site") return "Site"
  return "Other"
}

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

const discoverImportEdges = (files: ReadonlyArray<DiscoveredFile>) =>
  Effect.gen(function* () {
    const fileStore = yield* FileStore
    const knownFiles = new Set(files.map((file) => file.relativePath))
    const rawEdges = yield* Effect.forEach(files, (file) =>
      fileStore.readText(file.absolutePath).pipe(
        Effect.flatMap((content) =>
          Effect.promise(async () => {
            const imports = Array.from(content.matchAll(relativeImportPattern))
              .map((match) => match[1] ?? match[2])
              .filter((value): value is string => Boolean(value))

            const resolvedTargets = await Promise.all(imports.map((specifier) => resolveImportTarget(file.relativePath, specifier)))

            return resolvedTargets
              .filter((target): target is string => typeof target === "string")
              .filter((target) => knownFiles.has(target))
              .map((target) => ({
                from: toModuleId(file.relativePath),
                to: toModuleId(target),
                label: "imports"
              }))
          })
        )
      ),
    { concurrency: 8 }).pipe(Effect.map((entries) => entries.flat()))

    return Array.from(new Map(rawEdges.filter((edge) => edge.from !== edge.to).map((edge) => [`${edge.from}:${edge.to}:${edge.label}`, edge])).values())
  })

const makeStaticEdges = (manifests: ReadonlyArray<ProjectManifest>): ReadonlyArray<ArchitectureEdge> => [
  { from: "cli", to: "tools-programs", label: "dispatches" },
  { from: "tools-programs", to: "tools-core", label: "uses" },
  { from: "tools-programs", to: "tools-architecture", label: "refreshes docs with" },
  { from: "tools-programs", to: "tools-projects", label: "loads" },
  { from: "package-theme", to: "generated-site", label: "copies into" },
  { from: "site-src", to: "generated-site", label: "copies into" },
  { from: "package-ui", to: "generated-site", label: "bundles into" },
  { from: "generated-site", to: "rendered-site", label: "builds" },
  ...manifests.flatMap((manifest) => {
    const projectNode = `project-${manifest.slug}`
    const manifestNode = `manifest-${manifest.slug}`
    const sourceNode = `source-${manifest.slug}`

    return [
      { from: manifestNode, to: sourceNode, label: "points to" },
      { from: manifestNode, to: projectNode, label: "configures" },
      { from: sourceNode, to: projectNode, label: "feeds" },
      { from: projectNode, to: "generated-site", label: "emits pages/data" }
    ]
  })
]

const makeNodes = (files: ReadonlyArray<DiscoveredFile>, manifests: ReadonlyArray<ProjectManifest>): ReadonlyArray<ArchitectureNode> => {
  const fileCounts = new Map<string, number>()
  files.forEach((file) => {
    const moduleId = toModuleId(file.relativePath)
    fileCounts.set(moduleId, (fileCounts.get(moduleId) ?? 0) + 1)
  })

  const dynamicProjectNodes = manifests.flatMap((manifest) => [
    {
      id: `manifest-${manifest.slug}`,
      label: `manifest:${manifest.slug}`,
      group: "Project Manifests",
      detail: `projects/${manifest.slug}.yml`
    },
    {
      id: `source-${manifest.slug}`,
      label: `source:${manifest.slug}`,
      group: "Source Repos",
      detail: manifest.source_repo_path
    }
  ])

  const discoveredNodes = Array.from(fileCounts.entries()).map(([id, count]) => ({
    id,
    label: moduleLabel(id, manifests),
    group: moduleGroup(id),
    detail: `${count} tracked file${count === 1 ? "" : "s"}`
  }))

  return [
    ...discoveredNodes,
    ...dynamicProjectNodes,
    { id: "generated-site", label: "generated site", group: "Site", detail: "site/" },
    { id: "rendered-site", label: "rendered site", group: "Site", detail: "_site/" }
  ]
}

export const discoverArchitectureGraph = Effect.gen(function* () {
  const fileStore = yield* FileStore
  const manifests = yield* loadProjectManifests
  const rootEntries = yield* Effect.forEach(architectureRoots, (relativePath) => {
    const absolutePath = path.join(rootDirectory, relativePath)
    return pathExists(absolutePath).pipe(
      Effect.flatMap((exists) => exists ? readTree(absolutePath) : Effect.succeed([]))
    )
  }, { concurrency: 4 })
  const files = rootEntries.flat()
  const nodes = makeNodes(files, manifests)
  const importEdges = yield* discoverImportEdges(files)
  const edges = Array.from(new Map([...makeStaticEdges(manifests), ...importEdges].map((edge) => [`${edge.from}:${edge.to}:${edge.label}`, edge])).values())

  if (!nodes.length) {
    return yield* Effect.fail(new ArchitectureDiscoveryError({ reason: "No architecture nodes were discovered" }))
  }

  return { nodes, edges } satisfies ArchitectureGraph
})
