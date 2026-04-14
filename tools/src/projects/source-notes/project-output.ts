import { Effect } from "effect"
import type { CodeReferencesPanel } from "../../../../packages/graph/src/index.js"
import type { ProjectManifest } from "../schema.js"
import type { ProjectBuild, ProjectCard } from "../types.js"
import type { PageAsset } from "./assets.js"
import type { BuiltModule } from "./module-builder.js"
import { withSourceDocumentReferences } from "./documents.js"

export const buildSourceNotesCard = (manifest: ProjectManifest, sourceUrl: string): ProjectCard => ({
  slug: manifest.slug,
  title: manifest.title,
  description: manifest.description,
  url: `${manifest.route_base}/`,
  source_url: sourceUrl
})

export const attachReferencePanels = (
  builtModules: ReadonlyArray<BuiltModule>,
  referencePanels: ReadonlyMap<string, CodeReferencesPanel | null>
): Effect.Effect<ReadonlyArray<BuiltModule>, Error> =>
  Effect.forEach(builtModules, (module) =>
    Effect.forEach(module.documents, (document) =>
      withSourceDocumentReferences(document, referencePanels.get(document.metadata.id) ?? null)
    ).pipe(
      Effect.map((documents) => ({
        ...module,
        documents,
        files: [module.files[0]!, ...documents.map((document) => document.file)],
        module: {
          ...module.module,
          documents: documents.map((document) => document.metadata)
        }
      }))
    )
  )

export const assembleSourceNotesProject = (
  manifest: ProjectManifest,
  sourceUrl: string,
  repoReadme: Pick<PageAsset, "assets">,
  builtModules: ReadonlyArray<BuiltModule>,
  referencePanels: ReadonlyMap<string, CodeReferencesPanel | null>
) =>
  Effect.gen(function* () {
    const modulesWithReferences = yield* attachReferencePanels(builtModules, referencePanels)

    return {
      card: buildSourceNotesCard(manifest, sourceUrl),
      files: modulesWithReferences.flatMap((module) => module.files),
      assets: [...repoReadme.assets, ...modulesWithReferences.flatMap((module) => module.assets)]
    } satisfies ProjectBuild
  })
