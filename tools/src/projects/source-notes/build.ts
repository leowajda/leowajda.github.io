import { Effect } from "effect"
import path from "node:path"
import yaml from "yaml"
import { SourceNotesError } from "../../core/errors.js"
import { generatedSiteDirectory, rootDirectory } from "../../core/paths.js"
import { encodeYaml } from "../../core/yaml.js"
import { FileStore, GitClient } from "../../core/workspace.js"
import type { ProjectManifest } from "../schema.js"
import type { GeneratedAssetFile, GeneratedTextFile, ProjectAdapter, ProjectBuild, ProjectCard } from "../types.js"
import { buildProjectGraph } from "./graph.js"
import {
  SourceNotesProjectDataSchema,
  SourceProjectGraphSchema,
  type SourceNotesDocument,
  type SourceNotesModule,
  type SourceNotesProjectData,
  type SourceTreeNode
} from "./schema.js"

type ModuleCandidate = {
  readonly slug: string
  readonly title: string
  readonly absolutePath: string
  readonly relativePath: string
  readonly roots: ReadonlyArray<SourceRoot>
}

type PageAsset = {
  readonly markdown: string
  readonly assets: ReadonlyArray<GeneratedAssetFile>
  readonly firstImageUrl: string
}

type BuiltDocument = {
  readonly metadata: SourceNotesDocument
  readonly file: GeneratedTextFile
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
const markdownImagePattern = /!\[([^\]]*)\]\(([^)]+)\)/g

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

const toFrontMatter = (payload: Record<string, unknown>) => `---\n${yaml.stringify(payload)}---\n`

const buildCard = (manifest: ProjectManifest, sourceUrl: string): ProjectCard => ({
  slug: manifest.slug,
  title: manifest.title,
  description: manifest.description,
  url: `${manifest.route_base}/`,
  source_url: sourceUrl
})

const normalizeRemoteUrl = (remoteUrl: string) => {
  if (remoteUrl.startsWith("git@github.com:")) {
    return `https://github.com/${remoteUrl.slice("git@github.com:".length).replace(/\.git$/, "")}`
  }

  return remoteUrl.replace(/\.git$/, "")
}

const resolveGitMetadata = (repoRoot: string) =>
  Effect.gen(function* () {
    const gitClient = yield* GitClient
    const sourceUrl = yield* gitClient.runGit(repoRoot, "remote", "get-url", "origin").pipe(
      Effect.map(normalizeRemoteUrl),
      Effect.catchAll(() => Effect.succeed(""))
    )
    const branch = yield* gitClient.runGit(repoRoot, "rev-parse", "--abbrev-ref", "HEAD").pipe(
      Effect.catchAll(() => Effect.succeed("master"))
    )

    return { branch, sourceUrl }
  })

const maybeReadText = (filePath: string) =>
  Effect.gen(function* () {
    const fileStore = yield* FileStore
    const exists = yield* fileStore.fileExists(filePath)
    if (!exists) {
      return ""
    }

    return yield* fileStore.readText(filePath)
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

const sanitizeAssetPath = (rawPath: string) =>
  rawPath
    .replace(/^<|>$/g, "")
    .split(/\s+/)[0]

const sanitizeAssetTargetPath = (assetPath: string) => {
  const normalized = assetPath
    .split("/")
    .filter((segment) => segment !== "" && segment !== "." && segment !== "..")
    .join("/")

  return normalized || path.basename(assetPath)
}

const rewriteMarkdownAssets = (
  markdown: string,
  baseDirectory: string,
  assetScope: string
) =>
  Effect.gen(function* () {
    const fileStore = yield* FileStore
    const seen = new Map<string, string>()
    const assets: Array<GeneratedAssetFile> = []
    let firstImageUrl = ""

    const matches = Array.from(markdown.matchAll(markdownImagePattern))
    for (const match of matches) {
      const rawReference = match[2] ?? ""
      const cleanReference = sanitizeAssetPath(rawReference)
      if (!cleanReference || cleanReference.startsWith("http://") || cleanReference.startsWith("https://") || cleanReference.startsWith("/")) {
        continue
      }

      if (!seen.has(cleanReference)) {
        const sourcePath = path.resolve(baseDirectory, cleanReference)
        const exists = yield* fileStore.fileExists(sourcePath)
        if (!exists) {
          continue
        }

        const targetPath = path.join(generatedSiteDirectory, "assets/generated", assetScope, sanitizeAssetTargetPath(cleanReference))
        const publicUrl = `/${path.relative(generatedSiteDirectory, targetPath).split(path.sep).join("/")}`
        seen.set(cleanReference, publicUrl)
        assets.push({ source_path: sourcePath, target_path: targetPath })
        if (!firstImageUrl) {
          firstImageUrl = publicUrl
        }
      }
    }

    let rewritten = markdown
    for (const [reference, publicUrl] of seen.entries()) {
      rewritten = rewritten.replaceAll(`](${reference})`, `](${publicUrl})`)
      rewritten = rewritten.replaceAll(`](<${reference}>)`, `](${publicUrl})`)
    }

    return {
      markdown: rewritten.trim(),
      assets,
      firstImageUrl
    } satisfies PageAsset
  })

const buildFileTree = (
  rootLabel: string,
  entries: ReadonlyArray<{ readonly relativePath: string; readonly url: string }>
) => {
  const root: Array<SourceTreeNode> = []

  for (const entry of entries) {
    const segments = entry.relativePath.split("/").filter(Boolean)
    let cursor = root

    segments.forEach((segment, index) => {
      const isLeaf = index === segments.length - 1
      const treePath = `${rootLabel}/${segments.slice(0, index + 1).join("/")}`
      const existing = cursor.find((node) => node.title === segment && node.tree_path === treePath)
      if (existing) {
        cursor = existing.children as Array<SourceTreeNode>
        return
      }

      const nextNode: SourceTreeNode = {
        kind: isLeaf ? "file" : "directory",
        title: segment,
        tree_path: treePath,
        url: isLeaf ? entry.url : "",
        children: []
      }

      cursor.push(nextNode)
      cursor = nextNode.children as Array<SourceTreeNode>
    })
  }

  const sortNodes = (nodes: Array<SourceTreeNode>) => {
    nodes.sort((left, right) => {
      if (left.kind !== right.kind) {
        return left.kind === "directory" ? -1 : 1
      }

      return left.title.localeCompare(right.title)
    })
    nodes.forEach((node) => sortNodes(node.children as Array<SourceTreeNode>))
  }

  sortNodes(root)
  return root
}

const buildDocumentBody = (content: string, extension: string) => {
  const metadata = textFileMetadata[extension]
  if (!metadata) {
    return content
  }

  if (metadata.format === "markdown") {
    return content
  }

  return `~~~${metadata.syntax}\n${content.trimEnd()}\n~~~\n`
}

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
              Effect.map((content) => {
                const relativeToRoot = path.relative(root.absolutePath, filePath).split(path.sep).join("/")
                const treePath = `${root.label}/${relativeToRoot}`
                const extension = path.extname(filePath).toLowerCase()
                const baseName = path.basename(filePath)
                const routePath = relativeToRoot
                  .split("/")
                  .map((segment, index, segments) => index === segments.length - 1 ? slugify(path.parse(segment).name) : slugify(segment))
                  .filter(Boolean)
                  .join("/")
                const url = `${manifest.route_base}/${moduleCandidate.slug}/${routePath}/`
                const sourcePath = path.relative(repoRoot, filePath).split(path.sep).join("/")
                const sourceUrl = gitMetadata.sourceUrl ? `${gitMetadata.sourceUrl}/blob/${gitMetadata.branch}/${sourcePath}` : ""

                const breadcrumbs = [
                  { label: manifest.title, url: "" },
                  { label: moduleCandidate.title, url: `${manifest.route_base}/${moduleCandidate.slug}/` }
                ]

                relativeToRoot.split("/").slice(0, -1).forEach((segment) => {
                  breadcrumbs.push({ label: segment, url: "" })
                })

                return {
                  metadata: {
                    id: `${moduleCandidate.slug}:${treePath}`,
                    graph_node_id: `${manifest.slug}:${moduleCandidate.slug}:${treePath}`,
                    title: baseName,
                    url,
                    tree_path: treePath,
                    source_path: sourcePath,
                    source_url: sourceUrl,
                    language: textFileMetadata[extension]?.language ?? root.language,
                    format: textFileMetadata[extension]?.format ?? "code",
                    breadcrumbs
                  } satisfies SourceNotesDocument,
                  file: {
                    path: path.join(generatedSiteDirectory, manifest.slug, moduleCandidate.slug, routePath, "index.md"),
                    content: `${toFrontMatter({
                      layout: "source_document",
                      title: baseName,
                      description: `${baseName} notes`,
                      permalink: url,
                      body_class: "page-wide",
                      project_key: manifest.slug,
                      module_slug: moduleCandidate.slug,
                      document_id: `${moduleCandidate.slug}:${treePath}`,
                      graph_node_id: `${manifest.slug}:${moduleCandidate.slug}:${treePath}`,
                      page_source_url: sourceUrl,
                      tree_path: treePath,
                      source_path: sourcePath,
                      source_url: sourceUrl
                    })}\n${buildDocumentBody(content, extension)}`
                  } satisfies GeneratedTextFile
                } satisfies BuiltDocument
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

    const modulePage = {
      path: path.join(generatedSiteDirectory, manifest.slug, moduleCandidate.slug, "index.md"),
      content: `${toFrontMatter({
        layout: "source_module",
        title: moduleCandidate.title,
        description: `${moduleCandidate.title} notes`,
        permalink: `${manifest.route_base}/${moduleCandidate.slug}/`,
        body_class: "page-wide",
        project_key: manifest.slug,
        module_slug: moduleCandidate.slug,
        page_source_url: moduleSourceUrl,
        tree_path: ""
      })}\n${readme.markdown}\n`
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
    const gitMetadata = yield* resolveGitMetadata(repoRoot)
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

    const projectData: SourceNotesProjectData = {
      project: {
        slug: manifest.slug,
        title: manifest.title,
        description: manifest.description,
        url: `${manifest.route_base}/`,
        source_url: gitMetadata.sourceUrl,
        hero_image_url: repoReadme.firstImageUrl
      },
      modules: builtModules.map((module) => module.module)
    }

    const graphData = yield* buildProjectGraph(
      manifest.slug,
      repoRoot,
      builtModules.map((module) => ({
        slug: module.moduleSlug,
        absolutePath: module.modulePath,
        relativePath: module.moduleRelativePath,
        documents: module.module.documents
      }))
    )

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

    const graphFile = yield* encodeYaml(
      `Unable to encode generated source graph for '${manifest.slug}'`,
      SourceProjectGraphSchema,
      graphData
    ).pipe(
      Effect.map((content) => ({
        path: path.join(generatedSiteDirectory, `_data/generated/${manifest.slug}/source_graph.yml`),
        content
      } satisfies GeneratedTextFile))
    )

    return {
      card: buildCard(manifest, gitMetadata.sourceUrl),
      files: [dataFile, graphFile, ...builtModules.flatMap((module) => module.files)],
      assets: [...repoReadme.assets, ...builtModules.flatMap((module) => module.assets)]
    } satisfies ProjectBuild
  })

export const sourceNotesProjectAdapter: ProjectAdapter = {
  kind: "source-notes",
  build: buildSourceNotes
}
