import { Effect, Layer, Schema } from "effect"
import path from "node:path"
import yaml from "yaml"
import { buildBrowserAssets } from "../core/assets.js"
import { Workspace, WorkspaceLive } from "../core/workspace.js"
import { generatedSiteDirectory, projectsDirectory, rootDirectory, siteSourceDirectory, themeSourceDirectory } from "../core/paths.js"
import { ProjectAdapterRegistry, ProjectAdapterRegistryLive } from "../projects/registry.js"
import { ProjectManifestSchema } from "../projects/schema.js"

const parseYaml = <T>(raw: string, decoder: (input: unknown) => Effect.Effect<T, unknown>) =>
  Effect.try({
    try: () => yaml.parse(raw),
    catch: (error) => new Error(`Unable to parse YAML: ${String(error)}`)
  }).pipe(Effect.flatMap((value) => decoder(value).pipe(Effect.mapError((error) => new Error(String(error))))))

const loadProjectManifests = Effect.gen(function* () {
  const workspace = yield* Workspace
  const entries = yield* workspace.readDirectory(projectsDirectory)
  const manifestFiles = entries.filter((entry) => entry.isFile() && entry.name.endsWith(".yml"))
  return yield* Effect.forEach(manifestFiles, (entry) =>
    workspace.readText(path.join(projectsDirectory, entry.name)).pipe(
      Effect.flatMap((content) => parseYaml(content, Schema.decodeUnknown(ProjectManifestSchema)))
    )
  )
})

const program = Effect.gen(function* () {
  const workspace = yield* Workspace

  yield* workspace.runGit(rootDirectory, "submodule", "update", "--init", "--recursive")
  const manifests = yield* loadProjectManifests
  const { adapters } = yield* ProjectAdapterRegistry

  yield* workspace.removeDirectory(generatedSiteDirectory)
  yield* workspace.copyDirectoryContents(themeSourceDirectory, generatedSiteDirectory)
  yield* workspace.copyDirectoryContents(siteSourceDirectory, generatedSiteDirectory)

  const projectCards = yield* Effect.forEach(manifests, (manifest) => {
    const adapter = adapters[manifest.kind]
    return adapter
      ? adapter.build(manifest)
      : Effect.fail(new Error(`No project adapter registered for kind '${manifest.kind}'`))
  })

  yield* workspace.writeText(path.join(generatedSiteDirectory, "_data/generated/projects.yml"), yaml.stringify(projectCards))
  yield* buildBrowserAssets
})

export const generateSite = program.pipe(Effect.provide(Layer.mergeAll(ProjectAdapterRegistryLive, WorkspaceLive)))
