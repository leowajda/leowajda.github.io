import { Effect } from "effect"
import path from "node:path"
import { generatedSiteDirectory } from "../../core/paths.js"
import { encodeFrontMatter } from "../../core/frontmatter.js"
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
  moduleCandidate: ModuleCandidate,
  moduleSourceUrl: string,
  readmeMarkdown: string
) =>
  encodeFrontMatter(
    `Unable to encode module front matter for '${moduleCandidate.slug}'`,
    {
      layout: "source_module",
      title: moduleCandidate.title,
      description: `${moduleCandidate.title} notes`,
      permalink: `${manifest.route_base}/${moduleCandidate.slug}/`,
      body_class: "page-wide",
      project_key: manifest.slug,
      module_slug: moduleCandidate.slug,
      page_source_url: moduleSourceUrl,
      tree_path: ""
    }
  ).pipe(
    Effect.map((frontMatter) => ({
      path: path.join(generatedSiteDirectory, manifest.slug, moduleCandidate.slug, "index.md"),
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
    const modulePage = yield* buildModulePage(manifest, moduleCandidate, moduleSourceUrl, readme.markdown)

    return {
      modulePath: moduleCandidate.absolutePath,
      moduleSlug: moduleCandidate.slug,
      moduleRelativePath: moduleCandidate.relativePath,
      assets: readme.assets,
      files: [modulePage, ...builtDocuments.map((document) => document.file)],
      module: buildSourceNotesModuleData(
        manifest,
        moduleCandidate,
        moduleSourceUrl,
        readme.firstImageUrl,
        builtDocuments
      )
    } satisfies BuiltModule
  })
