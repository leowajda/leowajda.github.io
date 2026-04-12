import { Effect } from "effect"
import path from "node:path"
import { SourceNotesError } from "../../core/errors.js"
import { generatedSiteDirectory, rootDirectory } from "../../core/paths.js"
import { encodeYaml } from "../../core/yaml.js"
import { resolveRepositoryMetadata } from "../../core/repository.js"
import type { ProjectManifest } from "../schema.js"
import type { GeneratedTextFile, ProjectAdapter, ProjectBuild, ProjectCard } from "../types.js"
import { buildSourceNotesReferencePanels } from "./graph.js"
import { maybeReadText, rewriteMarkdownAssets } from "./assets.js"
import {
  discoverModuleCandidates,
  type ModuleCandidate
} from "./discovery.js"
import { buildSourceNotesModule, type BuiltModule } from "./module-builder.js"
import {
  SourceNotesProjectDataSchema,
  type SourceNotesProjectData
} from "./schema.js"

const buildCard = (manifest: ProjectManifest, sourceUrl: string): ProjectCard => ({
  slug: manifest.slug,
  title: manifest.title,
  description: manifest.description,
  url: `${manifest.route_base}/`,
  source_url: sourceUrl
})

const buildSourceNotes = (manifest: ProjectManifest) =>
  Effect.gen(function* () {
    const repoRoot = path.join(rootDirectory, manifest.source_repo_path)
    const gitMetadata = yield* resolveRepositoryMetadata(repoRoot)
    const repoReadmeSource = yield* maybeReadText(path.join(repoRoot, "README.md"))
    const repoReadme = yield* rewriteMarkdownAssets(repoReadmeSource, repoRoot, `${manifest.slug}/project`)
    const moduleCandidates = yield* discoverModuleCandidates(manifest, repoRoot)

    if (moduleCandidates.length === 0) {
      return yield* Effect.fail(new SourceNotesError({
        slug: manifest.slug,
        phase: "discoverModules",
        reason: `No displayable modules found in '${repoRoot}'`
      }))
    }

    const builtModules = yield* Effect.forEach(moduleCandidates, (moduleCandidate) =>
      buildSourceNotesModule(manifest, moduleCandidate, repoRoot, gitMetadata)
    , { concurrency: 4 })

    const referencePanels = yield* buildSourceNotesReferencePanels(
      manifest.slug,
      repoRoot,
      builtModules.map((module) => ({
        modulePath: module.modulePath,
        moduleSlug: module.moduleSlug,
        documents: module.module.documents
      }))
    )
    const modulesWithReferences = builtModules.map((module) => ({
      ...module,
      module: {
        ...module.module,
        documents: module.module.documents.map((document) => ({
          ...document,
          code_references: document.format === "code" ? (referencePanels.get(document.id) ?? null) : null
        }))
      }
    }))

    const projectData: SourceNotesProjectData = {
      project: {
        slug: manifest.slug,
        title: manifest.title,
        description: manifest.description,
        url: `${manifest.route_base}/`,
        source_url: gitMetadata.sourceUrl,
        hero_image_url: repoReadme.firstImageUrl
      },
      modules: modulesWithReferences.map((module) => module.module)
    }

    const dataFile = yield* encodeYaml(
      `Unable to encode generated source notes for '${manifest.slug}'`,
      SourceNotesProjectDataSchema,
      projectData
    ).pipe(
      Effect.map((content) => ({
        path: path.join(generatedSiteDirectory, `_data/generated/${manifest.slug}/source_notes.yml`),
        content
      } satisfies GeneratedTextFile))
    )

    return {
      card: buildCard(manifest, gitMetadata.sourceUrl),
      files: [dataFile, ...modulesWithReferences.flatMap((module) => module.files)],
      assets: [...repoReadme.assets, ...modulesWithReferences.flatMap((module) => module.assets)]
    } satisfies ProjectBuild
  })

export const sourceNotesProjectAdapter: ProjectAdapter = {
  kind: "source-notes",
  build: buildSourceNotes
}
