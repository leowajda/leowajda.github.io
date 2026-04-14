import { Effect } from "effect"
import { encodeFrontMatter } from "../../core/frontmatter.js"
import { generatedCollectionFile } from "../../core/jekyll.js"
import type { ProjectManifest } from "../schema.js"
import type { GeneratedAssetFile, GeneratedTextFile } from "../types.js"
import type { PageAsset } from "./assets.js"
import { buildFileTree, type BuiltSourceDocument } from "./documents.js"
import { titleizeModuleName, type ModuleCandidate } from "./discovery.js"
import type { SourceNotesModule } from "./schema.js"

export type BuiltModule = {
  readonly modulePath: string
  readonly moduleSlug: string
  readonly moduleRelativePath: string
  readonly assets: ReadonlyArray<GeneratedAssetFile>
  readonly documents: ReadonlyArray<BuiltSourceDocument>
  readonly files: ReadonlyArray<GeneratedTextFile>
  readonly module: SourceNotesModule
}

type GitMetadata = {
  readonly branch: string
  readonly sourceUrl: string
}

type ModuleReadme = Pick<PageAsset, "markdown" | "assets" | "firstImageUrl">

const buildModuleSourceUrl = (moduleCandidate: ModuleCandidate, gitMetadata: GitMetadata) =>
  gitMetadata.sourceUrl
    ? (moduleCandidate.relativePath
      ? `${gitMetadata.sourceUrl}/tree/${gitMetadata.branch}/${moduleCandidate.relativePath}`
      : `${gitMetadata.sourceUrl}/tree/${gitMetadata.branch}`)
    : ""

const buildModuleRoots = (
  moduleCandidate: ModuleCandidate,
  builtDocuments: ReadonlyArray<BuiltSourceDocument>
) =>
  moduleCandidate.roots.map((root) => ({
    label: root.label,
    tree_path: `${root.label}/`,
    nodes: buildFileTree(
      root.label,
      builtDocuments
        .filter((document) => document.metadata.tree_path.startsWith(`${root.label}/`))
        .map((document) => ({
          relativePath: document.metadata.tree_path.slice(`${root.label}/`.length),
          url: document.metadata.url
        }))
    )
  }))

export const buildSourceNotesModuleData = (
  manifest: ProjectManifest,
  moduleCandidate: ModuleCandidate,
  moduleSourceUrl: string,
  heroImageUrl: string,
  builtDocuments: ReadonlyArray<BuiltSourceDocument>
): SourceNotesModule => ({
  slug: moduleCandidate.slug,
  title: moduleCandidate.title,
  url: `${manifest.route_base}/${moduleCandidate.slug}/`,
  source_url: moduleSourceUrl,
  hero_image_url: heroImageUrl,
  language_labels: Array.from(new Set(moduleCandidate.roots.map((root) => titleizeModuleName(root.language)))),
  document_count: builtDocuments.length,
  roots: buildModuleRoots(moduleCandidate, builtDocuments),
  documents: builtDocuments.map((document) => document.metadata)
})

const buildModulePage = (
  manifest: ProjectManifest,
  module: SourceNotesModule,
  moduleSourceUrl: string,
  readmeMarkdown: string
) =>
  encodeFrontMatter(
    `Unable to encode module front matter for '${module.slug}'`,
    {
      title: module.title,
      description: `${module.title} notes`,
      project_key: manifest.slug,
      module_slug: module.slug,
      page_source_url: moduleSourceUrl,
      source_url: module.source_url,
      hero_image_url: module.hero_image_url,
      language_labels: module.language_labels,
      document_count: module.document_count,
      roots: module.roots,
      tree_path: ""
    }
  ).pipe(
    Effect.map((frontMatter) => ({
      path: generatedCollectionFile("source_modules", manifest.slug, `${module.slug}.md`),
      content: `${frontMatter}\n${readmeMarkdown}\n`
    } satisfies GeneratedTextFile))
  )

export const assembleSourceNotesModule = (
  manifest: ProjectManifest,
  moduleCandidate: ModuleCandidate,
  gitMetadata: GitMetadata,
  readme: ModuleReadme,
  builtDocuments: ReadonlyArray<BuiltSourceDocument>
) =>
  Effect.gen(function* () {
    const moduleSourceUrl = buildModuleSourceUrl(moduleCandidate, gitMetadata)
    const moduleData = buildSourceNotesModuleData(
      manifest,
      moduleCandidate,
      moduleSourceUrl,
      readme.firstImageUrl,
      builtDocuments
    )
    const modulePage = yield* buildModulePage(manifest, moduleData, moduleSourceUrl, readme.markdown)

    return {
      modulePath: moduleCandidate.absolutePath,
      moduleSlug: moduleCandidate.slug,
      moduleRelativePath: moduleCandidate.relativePath,
      assets: readme.assets,
      documents: builtDocuments,
      files: [modulePage, ...builtDocuments.map((document) => document.file)],
      module: moduleData
    } satisfies BuiltModule
  })
