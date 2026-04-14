import { Effect } from "effect"
import path from "node:path"
import { generatedSiteDirectory } from "../../core/paths.js"
import { encodeFrontMatter } from "../../core/frontmatter.js"
import type { ProjectManifest } from "../schema.js"
import type { GeneratedTextFile } from "../types.js"
import type { SourceNotesDocument, SourceTreeNode } from "./schema.js"

export type TextFileMetadata = {
  readonly format: "code" | "markdown"
  readonly syntax: string
  readonly language: string
}

export type BuiltSourceDocument = {
  readonly metadata: SourceNotesDocument
  readonly file: GeneratedTextFile
}

export type SourceDocumentBuildInput = {
  readonly manifest: ProjectManifest
  readonly moduleSlug: string
  readonly moduleTitle: string
  readonly repoRoot: string
  readonly rootLabel: string
  readonly defaultLanguage: string
  readonly filePath: string
  readonly rootAbsolutePath: string
  readonly gitBranch: string
  readonly gitSourceUrl: string
  readonly metadata: TextFileMetadata | undefined
  readonly slugify: (value: string) => string
}

export const toRelativePath = (fromPath: string, toPath: string) =>
  toPath.split(path.sep).join("/").replace(`${fromPath.split(path.sep).join("/")}/`, "")

export const buildRoutePath = (relativePath: string, slugify: (value: string) => string) =>
  relativePath
    .split("/")
    .map((segment, index, segments) => index === segments.length - 1 ? slugify(path.parse(segment).name) : slugify(segment))
    .filter(Boolean)
    .join("/")

export const buildDocumentBreadcrumbs = (
  manifest: ProjectManifest,
  moduleSlug: string,
  moduleTitle: string,
  relativePath: string
) => {
  const breadcrumbs = [
    { label: manifest.title, url: "" },
    { label: moduleTitle, url: `${manifest.route_base}/${moduleSlug}/` }
  ]

  relativePath.split("/").slice(0, -1).forEach((segment) => {
    breadcrumbs.push({ label: segment, url: "" })
  })

  return breadcrumbs
}

export const buildFileTree = (
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

const buildDocumentBody = (content: string, metadata: TextFileMetadata | undefined) => {
  if (!metadata || metadata.format === "markdown") {
    return content
  }

  return `~~~${metadata.syntax}\n${content.trimEnd()}\n~~~\n`
}

export const buildSourceDocument = (
  input: SourceDocumentBuildInput,
  content: string
): Effect.Effect<BuiltSourceDocument, Error> => {
  const relativeToRoot = toRelativePath(input.rootAbsolutePath, input.filePath)
  const treePath = `${input.rootLabel}/${relativeToRoot}`
  const routePath = buildRoutePath(relativeToRoot, input.slugify)
  const url = `${input.manifest.route_base}/${input.moduleSlug}/${routePath}/`
  const sourcePath = toRelativePath(input.repoRoot, input.filePath)
  const sourceUrl = input.gitSourceUrl ? `${input.gitSourceUrl}/blob/${input.gitBranch}/${sourcePath}` : ""
  const baseName = path.basename(input.filePath)
  const breadcrumbs = buildDocumentBreadcrumbs(
    input.manifest,
    input.moduleSlug,
    input.moduleTitle,
    relativeToRoot
  )
  const documentId = `${input.moduleSlug}:${treePath}`
  const graphNodeId = `${input.manifest.slug}:${input.moduleSlug}:${treePath}`

  return encodeFrontMatter(
    `Unable to encode source document front matter for '${sourcePath}'`,
    {
      layout: "source_document",
      title: baseName,
      description: `${baseName} notes`,
      permalink: url,
      project_key: input.manifest.slug,
      module_slug: input.moduleSlug,
      document_id: documentId,
      graph_node_id: graphNodeId,
      page_source_url: sourceUrl,
      tree_path: treePath,
      source_path: sourcePath,
      source_url: sourceUrl
    }
  ).pipe(
    Effect.map((frontMatter) => ({
      metadata: {
        id: documentId,
        graph_node_id: graphNodeId,
        title: baseName,
        url,
        tree_path: treePath,
        source_path: sourcePath,
        source_url: sourceUrl,
        language: input.metadata?.language ?? input.defaultLanguage,
        format: input.metadata?.format ?? "code",
        breadcrumbs,
        code_references: null
      } satisfies SourceNotesDocument,
      file: {
        path: path.join(generatedSiteDirectory, input.manifest.slug, input.moduleSlug, routePath, "index.md"),
        content: `${frontMatter}\n${buildDocumentBody(content, input.metadata)}`
      } satisfies GeneratedTextFile
    } satisfies BuiltSourceDocument))
  )
}
