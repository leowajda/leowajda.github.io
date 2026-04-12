import { Effect, Layer, Schema } from "effect"
import path from "node:path"
import { buildBrowserAssets } from "../core/assets.js"
import { decodeYaml, encodeYaml } from "../core/yaml.js"
import { FileStore, WorkspaceLive } from "../core/workspace.js"
import { generatedSiteDirectory, projectsDirectory, rootDirectory, siteSourceDirectory, themeSourceDirectory } from "../core/paths.js"
import { ProjectAdapterRegistry, ProjectAdapterRegistryLive } from "../projects/registry.js"
import { ProjectManifestSchema } from "../projects/schema.js"
import { ProjectRegistryError, ProjectSourceMissingError } from "../core/errors.js"
import { ProjectCardSchema, type ProjectBuild } from "../projects/types.js"
import type { ProjectManifest } from "../projects/schema.js"
import type { ProjectAdapter } from "../projects/types.js"

const ProjectsSchema = Schema.Array(ProjectCardSchema)

const resolveProjectAdapter = (
  adapters: Readonly<Record<string, ProjectAdapter>>,
  manifest: ProjectManifest
) => {
  const adapter = adapters[manifest.kind]

  return adapter
    ? Effect.succeed(adapter)
    : Effect.fail(new ProjectRegistryError({ kind: manifest.kind }))
}

const requireProjectSource = (manifest: ProjectManifest) =>
  Effect.gen(function* () {
    const fileStore = yield* FileStore
    const sourcePath = path.join(rootDirectory, manifest.source_repo_path)
    const exists = yield* fileStore.fileExists(sourcePath)

    if (!exists && manifest.source_optional) {
      return null
    }

    if (!exists) {
      return yield* Effect.fail(new ProjectSourceMissingError({
        slug: manifest.slug,
        sourcePath
      }))
    }

    return sourcePath
  })

const buildProject = (
  adapters: Readonly<Record<string, ProjectAdapter>>,
  manifest: ProjectManifest
) =>
  Effect.gen(function* () {
    const sourcePath = yield* requireProjectSource(manifest)
    if (sourcePath === null) {
      return null
    }

    const adapter = yield* resolveProjectAdapter(adapters, manifest)
    return yield* adapter.build(manifest)
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

const writeBuildOutputs = (builds: ReadonlyArray<ProjectBuild>) =>
  Effect.gen(function* () {
    const fileStore = yield* FileStore
    const files = builds.flatMap((build) => build.files)
    const assets = builds.flatMap((build) => build.assets)
    const projectsYaml = yield* encodeYaml("Unable to encode generated project index", ProjectsSchema, builds.map((build) => build.card))

    yield* Effect.forEach(files, (file) => fileStore.writeText(file.path, file.content), { concurrency: 8 })
    yield* Effect.forEach(assets, (asset) => fileStore.copyFile(asset.source_path, asset.target_path), { concurrency: 8 })
    yield* fileStore.writeText(path.join(generatedSiteDirectory, "_data/generated/projects.yml"), projectsYaml)
  })

const buildProjects = Effect.gen(function* () {
  const manifests = yield* loadProjectManifests
  const { adapters } = yield* ProjectAdapterRegistry

  return yield* Effect.forEach(manifests, (manifest) => buildProject(adapters, manifest), {
    concurrency: 4
  }).pipe(
    Effect.map((builds) => builds.filter((build): build is ProjectBuild => build !== null))
  )
})

const program = Effect.gen(function* () {
  const fileStore = yield* FileStore

  yield* fileStore.removeDirectory(generatedSiteDirectory)
  yield* fileStore.copyDirectoryContents(themeSourceDirectory, generatedSiteDirectory)
  yield* fileStore.copyDirectoryContents(siteSourceDirectory, generatedSiteDirectory)

  const builds = yield* buildProjects
  yield* writeBuildOutputs(builds)
  yield* buildBrowserAssets
})

export const generateSite = program.pipe(Effect.provide(Layer.mergeAll(ProjectAdapterRegistryLive, WorkspaceLive)))
