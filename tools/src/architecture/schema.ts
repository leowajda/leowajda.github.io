import { Schema } from "effect"

export const ArchitectureNodeSchema = Schema.Struct({
  id: Schema.String,
  label: Schema.String,
  group: Schema.String,
  detail: Schema.String
})

export const ArchitectureEdgeSchema = Schema.Struct({
  from: Schema.String,
  to: Schema.String,
  label: Schema.String
})

export const ArchitectureGraphSchema = Schema.Struct({
  nodes: Schema.Array(ArchitectureNodeSchema),
  edges: Schema.Array(ArchitectureEdgeSchema)
})

export type ArchitectureNode = Schema.Schema.Type<typeof ArchitectureNodeSchema>
export type ArchitectureEdge = Schema.Schema.Type<typeof ArchitectureEdgeSchema>
export type ArchitectureGraph = Schema.Schema.Type<typeof ArchitectureGraphSchema>
