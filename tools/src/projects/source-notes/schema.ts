import { Schema } from "effect"

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
  graph_node_id: Schema.String,
  title: Schema.String,
  url: Schema.String,
  tree_path: Schema.String,
  source_path: Schema.String,
  source_url: Schema.String,
  language: Schema.String,
  format: Schema.Literal("code", "markdown"),
  breadcrumbs: Schema.Array(SourceNotesBreadcrumbSchema)
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

export const SourceNotesProjectDataSchema = Schema.Struct({
  project: Schema.Struct({
    slug: Schema.String,
    title: Schema.String,
    description: Schema.String,
    url: Schema.String,
    source_url: Schema.String,
    hero_image_url: Schema.String
  }),
  modules: Schema.Array(SourceNotesModuleSchema)
})

export const SourceGraphNodeSchema = Schema.Struct({
  id: Schema.String,
  label: Schema.String,
  url: Schema.String,
  tree_path: Schema.String,
  language: Schema.String
})

export const SourceGraphEdgeSchema = Schema.Struct({
  source: Schema.String,
  target: Schema.String,
  kind: Schema.Literal("reference")
})

export const SourceProjectGraphSchema = Schema.Struct({
  version: Schema.Literal(1),
  project_slug: Schema.String,
  nodes: Schema.Array(SourceGraphNodeSchema),
  edges: Schema.Array(SourceGraphEdgeSchema)
})

export type SourceTreeNode = {
  readonly kind: "directory" | "file"
  readonly title: string
  readonly tree_path: string
  readonly url: string
  readonly children: ReadonlyArray<SourceTreeNode>
}

export type SourceNotesProjectData = Schema.Schema.Type<typeof SourceNotesProjectDataSchema>
export type SourceNotesModule = Schema.Schema.Type<typeof SourceNotesModuleSchema>
export type SourceNotesDocument = Schema.Schema.Type<typeof SourceNotesDocumentSchema>
export type SourceProjectGraph = Schema.Schema.Type<typeof SourceProjectGraphSchema>
