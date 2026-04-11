import { Effect, Layer, ParseResult, Schema } from "effect"
import path from "node:path"
import yaml from "yaml"
import { buildBrowserAssets } from "../core/assets.js"
import { Workspace, WorkspaceLive } from "../core/workspace.js"
import { generatedSiteDirectory, projectsDirectory, siteSourceDirectory, themeSourceDirectory } from "../core/paths.js"
import { ProjectAdapterRegistry, ProjectAdapterRegistryLive } from "../projects/registry.js"
import { ProjectManifestSchema } from "../projects/schema.js"

const formatSchemaError = (context: string) => (error: ParseResult.ParseError) =>
  new Error(`${context}\n${ParseResult.TreeFormatter.formatErrorSync(error)}`)

const parseYaml = <T>(context: string, raw: string, decoder: (input: unknown) => Effect.Effect<T, ParseResult.ParseError, never>) =>
  Effect.try({
    try: () => yaml.parse(raw),
    catch: (error) => new Error(`${context}: unable to parse YAML: ${String(error)}`)
  }).pipe(Effect.flatMap((value) => decoder(value).pipe(Effect.mapError(formatSchemaError(context)))))

const loadProjectManifests = Effect.gen(function* () {
  const workspace = yield* Workspace
  const entries = yield* workspace.readDirectory(projectsDirectory)
  const manifestFiles = entries.filter((entry) => entry.isFile() && entry.name.endsWith(".yml"))
  return yield* Effect.forEach(manifestFiles, (entry) =>
    workspace.readText(path.join(projectsDirectory, entry.name)).pipe(
      Effect.flatMap((content) => parseYaml(`Unable to decode project manifest '${entry.name}'`, content, Schema.decodeUnknown(ProjectManifestSchema)))
    )
  )
})

const program = Effect.gen(function* () {
  const workspace = yield* Workspace

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
