import { Effect } from "effect"
import path from "node:path"
import { SourceNotesError } from "../../core/errors.js"
import { generatedSiteDirectory, rootDirectory } from "../../core/paths.js"
import { encodeFrontMatter } from "../../core/frontmatter.js"
import { encodeYaml } from "../../core/yaml.js"
import { FileStore } from "../../core/workspace.js"
import { resolveRepositoryMetadata } from "../../core/repository.js"
import type { ProjectManifest } from "../schema.js"
import type { GeneratedAssetFile, GeneratedTextFile, ProjectAdapter, ProjectBuild, ProjectCard } from "../types.js"
import {
  buildFileTree,
  buildSourceDocument
} from "./documents.js"
import { buildSourceNotesReferencePanels } from "./graph.js"
import { maybeReadText, rewriteMarkdownAssets } from "./assets.js"
import {
  SourceNotesProjectDataSchema,
  type SourceNotesModule,
  type SourceNotesProjectData
} from "./schema.js"

type ModuleCandidate = {
  readonly slug: string
  readonly title: string
  readonly absolutePath: string
  readonly relativePath: string
  readonly roots: ReadonlyArray<SourceRoot>
}

type BuiltModule = {
  readonly modulePath: string
  readonly moduleSlug: string
  readonly moduleRelativePath: string
  readonly assets: ReadonlyArray<GeneratedAssetFile>
  readonly files: ReadonlyArray<GeneratedTextFile>
  readonly module: SourceNotesModule
}

const supportedSourceRoots = [
  { language: "java", label: "src/main/java" },
  { language: "scala", label: "src/main/scala" }
] as const

type SourceRoot = (typeof supportedSourceRoots)[number] & {
  readonly absolutePath: string
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

const ignoredDirectoryNames = new Set([".git", ".idea", ".bsp", "build", "dist", "node_modules", "out", "target"])

const slugify = (value: string) =>
  value
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[_\s]+/g, "-")
    .replace(/[^a-zA-Z0-9-]/g, "-")
    .toLowerCase()
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")

const titleize = (value: string) =>
  value
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")

const buildCard = (manifest: ProjectManifest, sourceUrl: string): ProjectCard => ({
  slug: manifest.slug,
  title: manifest.title,
  description: manifest.description,
  url: `${manifest.route_base}/`,
  source_url: sourceUrl
})

const detectModuleRoots = (absolutePath: string) =>
  Effect.gen(function* () {
    const fileStore = yield* FileStore
    const roots = yield* Effect.forEach(supportedSourceRoots, (root) =>
      fileStore.fileExists(path.join(absolutePath, root.label)).pipe(
        Effect.map((exists) =>
          exists
            ? ({
                language: root.language,
                label: root.label,
                absolutePath: path.join(absolutePath, root.label)
              } as SourceRoot)
            : null
        )
      )
    )

    return roots.filter((root): root is SourceRoot => root !== null)
  })

const discoverModuleCandidates = (manifest: ProjectManifest, repoRoot: string) =>
  Effect.gen(function* () {
    const fileStore = yield* FileStore
    const rootCandidate = {
      slug: "root",
      title: `${manifest.title} Source`,
      absolutePath: repoRoot,
      relativePath: "",
      roots: yield* detectModuleRoots(repoRoot)
    } satisfies ModuleCandidate

    const entries = yield* fileStore.readDirectory(repoRoot)
    const childCandidates = yield* Effect.forEach(
      entries.filter((entry) => entry.isDirectory() && !entry.name.startsWith(".") && !ignoredDirectoryNames.has(entry.name)),
      (entry) =>
        detectModuleRoots(path.join(repoRoot, entry.name)).pipe(
          Effect.map((roots) => ({
            slug: slugify(entry.name),
            title: titleize(entry.name),
            absolutePath: path.join(repoRoot, entry.name),
            relativePath: entry.name,
            roots
          } satisfies ModuleCandidate))
        )
    )

    const displayableChildren = childCandidates.filter((candidate) => candidate.roots.length > 0)
    if (displayableChildren.length > 0) {
      return displayableChildren
    }

    return rootCandidate.roots.length > 0 ? [rootCandidate] : []
  })

const walkTextFiles = (directory: string): Effect.Effect<ReadonlyArray<string>, Error, FileStore> =>
  Effect.gen(function* () {
    const fileStore = yield* FileStore
    const entries = yield* fileStore.readDirectory(directory)
    const nested = yield* Effect.forEach(entries, (entry) => {
      const fullPath = path.join(directory, entry.name)
      if (entry.isDirectory()) {
        if (entry.name.startsWith(".") || ignoredDirectoryNames.has(entry.name)) {
          return Effect.succeed([] as ReadonlyArray<string>)
        }

        return walkTextFiles(fullPath)
      }

      const extension = path.extname(entry.name).toLowerCase()
      return Effect.succeed(extension in textFileMetadata ? [fullPath] : [])
    }, { concurrency: 8 })

    return nested.flat()
  })

const buildModuleData = (
  manifest: ProjectManifest,
  moduleCandidate: ModuleCandidate,
  repoRoot: string,
  gitMetadata: { readonly branch: string; readonly sourceUrl: string }
) =>
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
      walkTextFiles(root.absolutePath).pipe(
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
                    slugify
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
      language_labels: Array.from(new Set(moduleCandidate.roots.map((root) => titleize(root.language)))),
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
      buildModuleData(manifest, moduleCandidate, repoRoot, gitMetadata)
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
