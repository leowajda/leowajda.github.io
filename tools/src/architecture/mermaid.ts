import type {
  ArchitectureDiagram,
  ArchitectureGraph,
  ArchitectureGroupDefinition,
  ArchitectureNode,
  NodeShape
} from "./schema.js"

export const diagramElementId = (value: string) => value.replace(/[^a-zA-Z0-9_]/g, "_")

const escapeLabel = (value: string) => value.replace(/"/g, "'")

const shapeForNode = (node: ArchitectureNode, groupMap: ReadonlyMap<string, ArchitectureGroupDefinition>) => {
  const shape: NodeShape = groupMap.get(node.group)?.defaultShape ?? "rectangle"

  switch (shape) {
    case "diamond":
      return `{${escapeLabel(node.label)}}`
    case "rounded":
      return `(${escapeLabel(node.label)})`
    case "stadium":
      return `([${escapeLabel(node.label)}])`
    case "rectangle":
    default:
      return `[${escapeLabel(node.label)}]`
  }
}

export const renderArchitectureMermaid = (
  graph: ArchitectureGraph,
  diagram: ArchitectureDiagram,
  groups: ReadonlyArray<ArchitectureGroupDefinition>
) => {
  const includedNodeIds = new Set(diagram.nodeIds)
  const nodes = graph.nodes.filter((node) => includedNodeIds.has(node.id))
  const edges = graph.edges.filter((edge) => includedNodeIds.has(edge.from) && includedNodeIds.has(edge.to) && edge.kind === "flow")
  const groupMap = new Map(groups.map((group) => [group.id, group]))
  const lines = [`flowchart ${diagram.direction}`]

  for (const node of nodes) {
    lines.push(`  ${diagramElementId(node.id)}${shapeForNode(node, groupMap)}`)
  }

  for (const edge of edges) {
    lines.push(`  ${diagramElementId(edge.from)} -->|${escapeLabel(edge.label)}| ${diagramElementId(edge.to)}`)
  }

  return lines.join("\n")
}
