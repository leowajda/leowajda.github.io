import { Schema } from "effect"
import type { CodeReferenceUrlKind } from "../../../packages/graph/src/index.js"

export const GraphArtifactVersion = 4 as const

export const GraphArtifactReferenceSchema = Schema.Struct({
  id: Schema.String,
  source_file_path: Schema.String,
  target_file_path: Schema.String
})

export const GraphArtifactSchema = Schema.Struct({
  version: Schema.Literal(GraphArtifactVersion),
  project_slug: Schema.String,
  workspace_slug: Schema.String,
  root_path: Schema.String,
  primary_language: Schema.String,
  references: Schema.Array(GraphArtifactReferenceSchema)
})

export type GraphArtifactReference = Schema.Schema.Type<typeof GraphArtifactReferenceSchema>
export type GraphArtifact = Schema.Schema.Type<typeof GraphArtifactSchema>

export type GraphWorkspaceKind = "scip-java" | "scip-python" | "scip-clang"

export type GraphResolvedFile = {
  readonly title: string
  readonly language: string
  readonly url: string
  readonly url_kind: CodeReferenceUrlKind
  readonly description: string
}

export type GraphWorkspaceDocument = {
  readonly id: string
  readonly workspace_relative_path: string
  readonly title: string
  readonly language: string
}

export type GraphWorkspaceInput = {
  readonly project_slug: string
  readonly workspace_slug: string
  readonly root_path: string
  readonly kind: GraphWorkspaceKind
  readonly primary_language: string
  readonly source_extensions: ReadonlyArray<string>
  readonly documents: ReadonlyArray<GraphWorkspaceDocument>
  readonly resolve_file: (workspaceRelativePath: string) => GraphResolvedFile | null
}
