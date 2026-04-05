import { Effect, Layer, Schema } from "effect"
import path from "node:path"
import yaml from "yaml"
import { buildBrowserAssets } from "../core/assets.js"
import { copyDirectoryContents, readDirectory, readText, removeDirectory, writeText } from "../core/io.js"
import { generatedSiteDirectory, projectsDirectory, siteSourceDirectory, themeSourceDirectory } from "../core/paths.js"
import { ProjectAdapterRegistry, ProjectAdapterRegistryLive } from "../projects/registry.js"
import { ProjectManifestSchema } from "../projects/schema.js"

const parseYaml = <T>(raw: string, decoder: (input: unknown) => Effect.Effect<T, unknown>) =>
  Effect.try({
    try: () => yaml.parse(raw),
    catch: (error) => new Error(`Unable to parse YAML: ${String(error)}`)
  }).pipe(Effect.flatMap((value) => decoder(value).pipe(Effect.mapError((error) => new Error(String(error))))))

const loadProjectManifests = Effect.gen(function* () {
  const entries = yield* readDirectory(projectsDirectory)
  const manifestFiles = entries.filter((entry) => entry.isFile() && entry.name.endsWith(".yml"))
  return yield* Effect.forEach(manifestFiles, (entry) =>
    readText(path.join(projectsDirectory, entry.name)).pipe(
      Effect.flatMap((content) => parseYaml(content, Schema.decodeUnknown(ProjectManifestSchema)))
    )
  )
})

const program = Effect.gen(function* () {
  const manifests = yield* loadProjectManifests
  const { adapters } = yield* ProjectAdapterRegistry

  yield* removeDirectory(generatedSiteDirectory)
  yield* copyDirectoryContents(themeSourceDirectory, generatedSiteDirectory)
  yield* copyDirectoryContents(siteSourceDirectory, generatedSiteDirectory)

  const projectCards = [] as Array<Record<string, string>>

  for (const manifest of manifests) {
    const adapter = adapters[manifest.kind]
    if (!adapter) {
      return yield* Effect.fail(new Error(`No project adapter registered for kind '${manifest.kind}'`))
    }

    projectCards.push(yield* adapter.build(manifest))
  }

  yield* writeText(path.join(generatedSiteDirectory, "_data/generated/projects.yml"), yaml.stringify(projectCards))
  yield* buildBrowserAssets
})

export const generateSite = program.pipe(Effect.provide(ProjectAdapterRegistryLive))
