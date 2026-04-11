import { Context, Effect, Layer } from "effect"
import { mountForceGraph } from "./source-graph-renderer"

type SourceGraphNode = {
  readonly id: string
  readonly label: string
  readonly url: string
  readonly tree_path: string
  readonly language: string
}

type SourceGraphEdge = {
  readonly source: string
  readonly target: string
  readonly kind: "reference"
}

type SourceProjectGraph = {
  readonly project_slug: string
  readonly nodes: ReadonlyArray<SourceGraphNode>
  readonly edges: ReadonlyArray<SourceGraphEdge>
}

type SourceGraphRenderInput = {
  readonly currentNodeId: string
  readonly nodes: ReadonlyArray<{
    readonly id: string
    readonly label: string
    readonly url: string
  }>
  readonly edges: ReadonlyArray<{
    readonly source: string
    readonly target: string
    readonly direction: "inbound" | "outbound"
  }>
}

interface SourceGraphRendererService {
  readonly mount: (container: HTMLDivElement, input: SourceGraphRenderInput) => Effect.Effect<() => void, never>
}

class SourceGraphRenderer extends Context.Tag("SourceGraphRenderer")<SourceGraphRenderer, SourceGraphRendererService>() {}

const SourceGraphRendererLive = Layer.succeed(SourceGraphRenderer, {
  mount: (container, input) => Effect.sync(() => mountForceGraph(container, input))
})

const decodePayload = (container: HTMLDivElement): SourceProjectGraph | null => {
  const payload = container.querySelector<HTMLScriptElement>("script[data-source-graph-payload]")
  if (!payload) {
    return null
  }

  let graph: SourceProjectGraph | null = null
  try {
    graph = JSON.parse(payload.textContent ?? "") as SourceProjectGraph
  } catch {
    graph = null
  }
  payload.remove()

  if (!graph || !Array.isArray(graph.nodes) || !Array.isArray(graph.edges)) {
    return null
  }

  return graph
}

const toRenderInput = (container: HTMLDivElement, graph: SourceProjectGraph): SourceGraphRenderInput | null => {
  const currentNodeId = container.dataset.currentNode ?? ""
  const currentNode = graph.nodes.find((node) => node.id === currentNodeId)
  if (!currentNode) {
    return null
  }

  const collectionPrefix = `${currentNodeId.split(":").slice(0, 2).join(":")}:`
  const relevantEdges = graph.edges.filter((edge) =>
    (edge.source === currentNodeId || edge.target === currentNodeId) &&
    edge.source.startsWith(collectionPrefix) &&
    edge.target.startsWith(collectionPrefix)
  )

  if (relevantEdges.length === 0) {
    return null
  }

  const connectedNodeIds = new Set(
    relevantEdges.map((edge) => edge.source === currentNodeId ? edge.target : edge.source)
  )
  const connectedNodes = graph.nodes
    .filter((node) => connectedNodeIds.has(node.id))
    .sort((left, right) => left.label.localeCompare(right.label))
    .slice(0, 18)

  const scopedNodeIds = new Set([currentNodeId, ...connectedNodes.map((node) => node.id)])
  const scopedEdges = relevantEdges
    .filter((edge) => scopedNodeIds.has(edge.source) && scopedNodeIds.has(edge.target))
    .map((edge) => ({
      source: edge.source,
      target: edge.target,
      direction: edge.source === currentNodeId ? "outbound" as const : "inbound" as const
    }))
  if (scopedEdges.length === 0) {
    return null
  }

  return {
    currentNodeId,
    nodes: [currentNode, ...connectedNodes].map((node) => ({
      id: node.id,
      label: node.label,
      url: node.url
    })),
    edges: scopedEdges
  }
}

const mountContainer = (container: HTMLDivElement) =>
  Effect.gen(function* () {
    if (container.dataset.graphReady === "true") {
      return null
    }

    const graph = decodePayload(container)
    if (!graph || graph.nodes.length === 0) {
      container.remove()
      return null
    }

    const input = toRenderInput(container, graph)
    if (!input) {
      container.remove()
      return null
    }

    container.dataset.graphReady = "true"
    container.dataset.graphNodeCount = String(input.nodes.length)
    container.dataset.graphEdgeCount = String(input.edges.length)

    const renderer = yield* SourceGraphRenderer
    return yield* renderer.mount(container, input)
  })

export const initializeSourceGraphs = Effect.gen(function* () {
  const containers = Array.from(document.querySelectorAll<HTMLDivElement>("[data-source-graph]"))
  if (containers.length === 0) {
    return
  }

  const cleanups = yield* Effect.forEach(containers, (container) => mountContainer(container))
  const activeCleanups = cleanups.filter((cleanup): cleanup is () => void => cleanup !== null)
  if (activeCleanups.length === 0) {
    return
  }

  window.addEventListener("pagehide", () => {
    activeCleanups.forEach((cleanup) => cleanup())
  }, { once: true })
}).pipe(
  Effect.provide(SourceGraphRendererLive)
)
