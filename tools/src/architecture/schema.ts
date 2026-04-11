import { Schema } from "effect"

export const ArchitectureOriginSchema = Schema.Literal("discovered", "declared", "project")
export const ArchitectureEdgeKindSchema = Schema.Literal("flow", "dependency", "annotation")
export const DiagramDirectionSchema = Schema.Literal("LR", "TB")
export const DiagramPlacementSchema = Schema.Literal("top", "right", "bottom", "left")
export const NodeShapeSchema = Schema.Literal("rectangle", "rounded", "diamond", "stadium")

export const PaletteSchema = Schema.Struct({
  stroke: Schema.String,
  fill: Schema.String,
  text: Schema.String
})

export const ArchitectureGroupDefinitionSchema = Schema.Struct({
  id: Schema.String,
  title: Schema.String,
  palette: PaletteSchema,
  defaultShape: NodeShapeSchema
})

export const ModulePathMatchRuleSchema = Schema.Union(
  Schema.Struct({
    kind: Schema.Literal("exact"),
    value: Schema.String
  }),
  Schema.Struct({
    kind: Schema.Literal("prefix"),
    value: Schema.String
  }),
  Schema.Struct({
    kind: Schema.Literal("project_prefix"),
    value: Schema.String
  })
)

export const ArchitectureModuleDefinitionSchema = Schema.Struct({
  id: Schema.String,
  label: Schema.String,
  group: Schema.String,
  detail: Schema.String,
  tags: Schema.Array(Schema.String),
  role: Schema.optional(Schema.String),
  match: Schema.Array(ModulePathMatchRuleSchema)
})

export const TopologyNodeDefinitionSchema = Schema.Struct({
  id: Schema.String,
  label: Schema.String,
  group: Schema.String,
  detail: Schema.String,
  tags: Schema.Array(Schema.String),
  role: Schema.optional(Schema.String)
})

export const TopologyEdgeDefinitionSchema = Schema.Struct({
  from: Schema.String,
  to: Schema.String,
  label: Schema.String,
  kind: ArchitectureEdgeKindSchema,
  tags: Schema.Array(Schema.String)
})

export const TopologyConfigSchema = Schema.Struct({
  nodes: Schema.Array(TopologyNodeDefinitionSchema),
  edges: Schema.Array(TopologyEdgeDefinitionSchema),
  projectNodes: Schema.Array(TopologyNodeDefinitionSchema),
  projectEdges: Schema.Array(TopologyEdgeDefinitionSchema)
})

export const DiagramSelectorSchema = Schema.Struct({
  ids: Schema.optional(Schema.Array(Schema.String)),
  groups: Schema.optional(Schema.Array(Schema.String)),
  roles: Schema.optional(Schema.Array(Schema.String)),
  tags: Schema.optional(Schema.Array(Schema.String)),
  projects: Schema.optional(Schema.Array(Schema.String)),
  origins: Schema.optional(Schema.Array(ArchitectureOriginSchema))
})

export const DiagramAnnotationDefinitionSchema = Schema.Struct({
  id: Schema.String,
  target: DiagramSelectorSchema,
  text: Schema.String,
  placement: DiagramPlacementSchema,
  tone: Schema.String
})

export const ArchitectureDiagramDefinitionSchema = Schema.Struct({
  id: Schema.String,
  title: Schema.String,
  direction: DiagramDirectionSchema,
  selectors: Schema.Array(DiagramSelectorSchema),
  annotations: Schema.Array(DiagramAnnotationDefinitionSchema)
})

export const ArchitectureNodeStatsSchema = Schema.Struct({
  trackedFiles: Schema.optional(Schema.Number)
})

export const ArchitectureNodeSchema = Schema.Struct({
  id: Schema.String,
  label: Schema.String,
  group: Schema.String,
  detail: Schema.String,
  origin: ArchitectureOriginSchema,
  project: Schema.optional(Schema.String),
  role: Schema.optional(Schema.String),
  tags: Schema.Array(Schema.String),
  stats: Schema.optional(ArchitectureNodeStatsSchema)
})

export const ArchitectureEdgeSchema = Schema.Struct({
  from: Schema.String,
  to: Schema.String,
  label: Schema.String,
  kind: ArchitectureEdgeKindSchema,
  origin: ArchitectureOriginSchema,
  project: Schema.optional(Schema.String),
  tags: Schema.Array(Schema.String)
})

export const ArchitectureGraphSchema = Schema.Struct({
  nodes: Schema.Array(ArchitectureNodeSchema),
  edges: Schema.Array(ArchitectureEdgeSchema)
})

export const CompiledDiagramAnnotationSchema = Schema.Struct({
  id: Schema.String,
  target: Schema.String,
  text: Schema.String,
  placement: DiagramPlacementSchema,
  tone: Schema.String
})

export const ArchitectureDiagramSchema = Schema.Struct({
  id: Schema.String,
  title: Schema.String,
  direction: DiagramDirectionSchema,
  nodeIds: Schema.Array(Schema.String),
  annotations: Schema.Array(CompiledDiagramAnnotationSchema)
})

export const RenderGroupThemeSchema = Schema.Struct({
  id: Schema.String,
  title: Schema.String,
  palette: PaletteSchema
})

export const RenderNodeSchema = Schema.Struct({
  id: Schema.String,
  label: Schema.String,
  group: Schema.String
})

export const DiagramRenderSpecSchema = Schema.Struct({
  id: Schema.String,
  title: Schema.String,
  mermaid: Schema.String,
  groups: Schema.Array(RenderGroupThemeSchema),
  nodes: Schema.Array(RenderNodeSchema),
  annotations: Schema.Array(CompiledDiagramAnnotationSchema)
})

export const DiagramRenderResultSchema = Schema.Struct({
  svg: Schema.String,
  scene: Schema.String
})

export const ArchitectureConfigSchema = Schema.Struct({
  groups: Schema.Array(ArchitectureGroupDefinitionSchema),
  modules: Schema.Array(ArchitectureModuleDefinitionSchema),
  topology: TopologyConfigSchema,
  diagrams: Schema.Array(ArchitectureDiagramDefinitionSchema)
})

export type ArchitectureOrigin = Schema.Schema.Type<typeof ArchitectureOriginSchema>
export type ArchitectureEdgeKind = Schema.Schema.Type<typeof ArchitectureEdgeKindSchema>
export type DiagramDirection = Schema.Schema.Type<typeof DiagramDirectionSchema>
export type DiagramPlacement = Schema.Schema.Type<typeof DiagramPlacementSchema>
export type NodeShape = Schema.Schema.Type<typeof NodeShapeSchema>
export type Palette = Schema.Schema.Type<typeof PaletteSchema>
export type ArchitectureGroupDefinition = Schema.Schema.Type<typeof ArchitectureGroupDefinitionSchema>
export type ModulePathMatchRule = Schema.Schema.Type<typeof ModulePathMatchRuleSchema>
export type ArchitectureModuleDefinition = Schema.Schema.Type<typeof ArchitectureModuleDefinitionSchema>
export type TopologyNodeDefinition = Schema.Schema.Type<typeof TopologyNodeDefinitionSchema>
export type TopologyEdgeDefinition = Schema.Schema.Type<typeof TopologyEdgeDefinitionSchema>
export type TopologyConfig = Schema.Schema.Type<typeof TopologyConfigSchema>
export type DiagramSelector = Schema.Schema.Type<typeof DiagramSelectorSchema>
export type DiagramAnnotationDefinition = Schema.Schema.Type<typeof DiagramAnnotationDefinitionSchema>
export type ArchitectureDiagramDefinition = Schema.Schema.Type<typeof ArchitectureDiagramDefinitionSchema>
export type ArchitectureNodeStats = Schema.Schema.Type<typeof ArchitectureNodeStatsSchema>
export type ArchitectureNode = Schema.Schema.Type<typeof ArchitectureNodeSchema>
export type ArchitectureEdge = Schema.Schema.Type<typeof ArchitectureEdgeSchema>
export type ArchitectureGraph = Schema.Schema.Type<typeof ArchitectureGraphSchema>
export type CompiledDiagramAnnotation = Schema.Schema.Type<typeof CompiledDiagramAnnotationSchema>
export type ArchitectureDiagram = Schema.Schema.Type<typeof ArchitectureDiagramSchema>
export type RenderGroupTheme = Schema.Schema.Type<typeof RenderGroupThemeSchema>
export type RenderNode = Schema.Schema.Type<typeof RenderNodeSchema>
export type DiagramRenderSpec = Schema.Schema.Type<typeof DiagramRenderSpecSchema>
export type DiagramRenderResult = Schema.Schema.Type<typeof DiagramRenderResultSchema>
export type ArchitectureConfig = Schema.Schema.Type<typeof ArchitectureConfigSchema>
