import { Schema } from "effect"
import { CodeReferencesPanelSchema } from "../../../../packages/graph/src/index.js"

export const SourceNotesBreadcrumbSchema = Schema.Struct({
  label: Schema.String,
  url: Schema.String
})

export const SourceTreeNodeSchema: Schema.Schema<SourceTreeNode> = Schema.suspend(() =>
  Schema.Struct({
    kind: Schema.Literal("directory", "file"),
    title: Schema.String,
    tree_path: Schema.String,
    url: Schema.String,
    children: Schema.Array(SourceTreeNodeSchema)
  })
)

export const SourceModuleRootSchema = Schema.Struct({
  label: Schema.String,
  tree_path: Schema.String,
  nodes: Schema.Array(SourceTreeNodeSchema)
})

export const SourceNotesDocumentSchema = Schema.Struct({
  id: Schema.String,
  project_key: Schema.String,
  module_slug: Schema.String,
  graph_node_id: Schema.String,
  title: Schema.String,
  url: Schema.String,
  tree_path: Schema.String,
  source_path: Schema.String,
  source_url: Schema.String,
  language: Schema.String,
  format: Schema.Literal("code", "markdown"),
  breadcrumbs: Schema.Array(SourceNotesBreadcrumbSchema),
  code_references: Schema.NullOr(CodeReferencesPanelSchema)
})

export const SourceNotesModuleSchema = Schema.Struct({
  slug: Schema.String,
  title: Schema.String,
  url: Schema.String,
  source_url: Schema.String,
  hero_image_url: Schema.String,
  language_labels: Schema.Array(Schema.String),
  document_count: Schema.Number,
  roots: Schema.Array(SourceModuleRootSchema),
  documents: Schema.Array(SourceNotesDocumentSchema)
})

export type SourceTreeNode = {
  readonly kind: "directory" | "file"
  readonly title: string
  readonly tree_path: string
  readonly url: string
  readonly children: ReadonlyArray<SourceTreeNode>
}

export type SourceNotesModule = Schema.Schema.Type<typeof SourceNotesModuleSchema>
export type SourceNotesDocument = Schema.Schema.Type<typeof SourceNotesDocumentSchema>
