import type { ArchitectureGraph } from "./schema.js"

const mermaidId = (value: string) => value.replace(/[^a-zA-Z0-9_]/g, "_")

const escapeLabel = (value: string) => value.replace(/"/g, "'")

export const renderArchitectureMermaid = (graph: ArchitectureGraph) => {
  const lines = ["flowchart LR"]

  for (const node of graph.nodes) {
    const shape = node.id === "cli" ? `(${escapeLabel(node.label)})` : `[${escapeLabel(node.label)}]`
    lines.push(`  ${mermaidId(node.id)}${shape}`)
  }

  for (const edge of graph.edges) {
    lines.push(`  ${mermaidId(edge.from)} --> ${mermaidId(edge.to)}`)
  }

  return lines.join("\n")
}
