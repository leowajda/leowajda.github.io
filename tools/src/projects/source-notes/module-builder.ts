import { Effect } from "effect"
import path from "node:path"
import { generatedSiteDirectory } from "../../core/paths.js"
import { encodeFrontMatter } from "../../core/frontmatter.js"
import { FileStore } from "../../core/workspace.js"
import type { ProjectManifest } from "../schema.js"
import type { GeneratedAssetFile, GeneratedTextFile } from "../types.js"
import { maybeReadText, rewriteMarkdownAssets } from "./assets.js"
import {
  buildFileTree,
  buildSourceDocument
} from "./documents.js"
import {
  titleizeModuleName,
  walkTextFiles,
  slugifyModuleName,
  type ModuleCandidate
} from "./discovery.js"
import type { SourceNotesModule } from "./schema.js"

type BuiltModule = {
  readonly modulePath: string
  readonly moduleSlug: string
  readonly moduleRelativePath: string
  readonly assets: ReadonlyArray<GeneratedAssetFile>
  readonly files: ReadonlyArray<GeneratedTextFile>
  readonly module: SourceNotesModule
}

const textFileMetadata: Readonly<Record<string, { readonly format: "code" | "markdown"; readonly syntax: string; readonly language: string }>> = {
  ".conf": { format: "code", syntax: "conf", language: "config" },
  ".gradle": { format: "code", syntax: "groovy", language: "groovy" },
  ".java": { format: "code", syntax: "java", language: "java" },
  ".json": { format: "code", syntax: "json", language: "json" },
  ".kts": { format: "code", syntax: "kotlin", language: "kotlin" },
  ".md": { format: "markdown", syntax: "", language: "markdown" },
  ".properties": { format: "code", syntax: "properties", language: "properties" },
  ".scala": { format: "code", syntax: "scala", language: "scala" },
  ".sc": { format: "code", syntax: "scala", language: "scala" },
  ".sbt": { format: "code", syntax: "scala", language: "scala" },
  ".sql": { format: "code", syntax: "sql", language: "sql" },
  ".txt": { format: "markdown", syntax: "", language: "text" },
  ".xml": { format: "code", syntax: "xml", language: "xml" },
  ".yaml": { format: "code", syntax: "yaml", language: "yaml" },
  ".yml": { format: "code", syntax: "yaml", language: "yaml" }
}

const supportedTextExtensions = new Set(Object.keys(textFileMetadata))

export const buildSourceNotesModule = (
  manifest: ProjectManifest,
  moduleCandidate: ModuleCandidate,
  repoRoot: string,
  gitMetadata: { readonly branch: string; readonly sourceUrl: string }
): Effect.Effect<BuiltModule, Error, FileStore> =>
  Effect.gen(function* () {
    const fileStore = yield* FileStore
    const readmePath = path.join(moduleCandidate.absolutePath, "README.md")
    const readmeSource = yield* maybeReadText(readmePath)
    const readme = yield* rewriteMarkdownAssets(readmeSource, moduleCandidate.absolutePath, `${manifest.slug}/${moduleCandidate.slug}`)
    const moduleSourceUrl = gitMetadata.sourceUrl
      ? (moduleCandidate.relativePath
        ? `${gitMetadata.sourceUrl}/tree/${gitMetadata.branch}/${moduleCandidate.relativePath}`
        : `${gitMetadata.sourceUrl}/tree/${gitMetadata.branch}`)
      : ""

    const builtDocuments = yield* Effect.forEach(moduleCandidate.roots, (root) =>
      walkTextFiles(root.absolutePath, supportedTextExtensions).pipe(
        Effect.flatMap((files) =>
          Effect.forEach(files, (filePath) =>
            fileStore.readText(filePath).pipe(
              Effect.flatMap((content) => {
                const extension = path.extname(filePath).toLowerCase()
                return buildSourceDocument(
                  {
                    manifest,
                    moduleSlug: moduleCandidate.slug,
                    moduleTitle: moduleCandidate.title,
                    repoRoot,
                    rootLabel: root.label,
                    defaultLanguage: root.language,
                    filePath,
                    rootAbsolutePath: root.absolutePath,
                    gitBranch: gitMetadata.branch,
                    gitSourceUrl: gitMetadata.sourceUrl,
                    metadata: textFileMetadata[extension],
                    slugify: slugifyModuleName
                  },
                  content
                )
              })
            )
          , { concurrency: 8 })
        )
      )
    , { concurrency: 4 }).pipe(
      Effect.map((documents) => documents.flat())
    )

    const roots = moduleCandidate.roots.map((root) => ({
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

    const moduleData: SourceNotesModule = {
      slug: moduleCandidate.slug,
      title: moduleCandidate.title,
      url: `${manifest.route_base}/${moduleCandidate.slug}/`,
      source_url: moduleSourceUrl,
      hero_image_url: readme.firstImageUrl,
      language_labels: Array.from(new Set(moduleCandidate.roots.map((root) => titleizeModuleName(root.language)))),
      document_count: builtDocuments.length,
      roots,
      documents: builtDocuments.map((document) => document.metadata)
    }

    const modulePageFrontMatter = yield* encodeFrontMatter(
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
    )

    const modulePage = {
      path: path.join(generatedSiteDirectory, manifest.slug, moduleCandidate.slug, "index.md"),
      content: `${modulePageFrontMatter}\n${readme.markdown}\n`
    } satisfies GeneratedTextFile

    return {
      modulePath: moduleCandidate.absolutePath,
      moduleSlug: moduleCandidate.slug,
      moduleRelativePath: moduleCandidate.relativePath,
      assets: readme.assets,
      files: [modulePage, ...builtDocuments.map((document) => document.file)],
      module: moduleData
    } satisfies BuiltModule
  })

export type { BuiltModule }
