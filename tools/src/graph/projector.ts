import path from "node:path"
import { CodeReferencesVersion, type CodeReference, type CodeReferencesPanel } from "../../../packages/graph/src/index.js"
import type { GraphArtifact, GraphArtifactReference, GraphResolvedFile, GraphWorkspaceDocument, GraphWorkspaceInput } from "./model.js"

type AggregatedReference = {
  readonly file_path: string
}

const sortReferences = (left: CodeReference, right: CodeReference) =>
  left.title.localeCompare(right.title) || left.file_path.localeCompare(right.file_path)

const resolveFile = (
  workspace: GraphWorkspaceInput,
  workspaceRelativePath: string
): GraphResolvedFile => (
  workspace.resolve_file(workspaceRelativePath) ?? {
    title: path.basename(workspaceRelativePath),
    language: workspace.primary_language,
    url: "",
    url_kind: "none",
    description: workspaceRelativePath
  }
)

const toPanelReference = (
  workspace: GraphWorkspaceInput,
  aggregated: AggregatedReference
): CodeReference => {
  const resolved = resolveFile(workspace, aggregated.file_path)

  return {
    title: resolved.title,
    file_path: aggregated.file_path,
    language: resolved.language,
    url: resolved.url,
    url_kind: resolved.url_kind
  }
}

const aggregateReferences = (
  references: ReadonlyArray<GraphArtifactReference>,
  resolveFilePath: (reference: GraphArtifactReference) => string | null
) =>
  Array.from(
    references.reduce((files, reference) => {
      const filePath = resolveFilePath(reference)
      if (filePath) {
        files.add(filePath)
      }

      return files
    }, new Set<string>()),
    (file_path) => ({ file_path })
  )

export const buildCodeReferencesPanel = (
  artifact: GraphArtifact,
  workspace: GraphWorkspaceInput,
  document: GraphWorkspaceDocument
): CodeReferencesPanel | null => {
  const focusPath = document.workspace_relative_path

  const uses = aggregateReferences(
    artifact.references,
    (reference) =>
      reference.source_file_path === focusPath && reference.target_file_path !== focusPath
        ? reference.target_file_path
        : null
  )
    .map((reference) => toPanelReference(workspace, reference))
    .sort(sortReferences)

  const usedBy = aggregateReferences(
    artifact.references,
    (reference) =>
      reference.target_file_path === focusPath && reference.source_file_path !== focusPath
        ? reference.source_file_path
        : null
  )
    .map((reference) => toPanelReference(workspace, reference))
    .sort(sortReferences)

  if (uses.length === 0 && usedBy.length === 0) {
    return null
  }

  return {
    version: CodeReferencesVersion,
    focus_file_path: focusPath,
    focus_title: document.title,
    language: document.language,
    uses,
    used_by: usedBy
  }
}
