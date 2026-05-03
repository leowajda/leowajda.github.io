export const createFlowchartState = () => ({
  selectedId: "",
  previewId: null,
  activePanel: "summary"
})

const incomingEdgesByTarget = (edges) =>
  new Map(edges.map((edge) => [edge.to, edge]))

const outgoingEdgesBySource = (edges) =>
  edges.reduce((result, edge) => {
    const sourceId = edge.from || ""
    if (!sourceId) {
      return result
    }

    if (!result.has(sourceId)) {
      result.set(sourceId, [])
    }
    result.get(sourceId).push(edge)
    return result
  }, new Map())

const readNodeMeta = (node, incomingEdge) => {
  const nodeText = node.text || node.label || ""
  const nodeCanvasText = node.label || nodeText
  const isDecision = node.kind === "decision"

  return [node.id, {
    id: node.id,
    kind: node.kind || "",
    text: nodeText,
    title: nodeText,
    label: nodeCanvasText,
    question: isDecision ? nodeText : "",
    parentId: incomingEdge?.from || "",
    answer: incomingEdge?.label || ""
  }]
}

export const buildNodeMetaMap = ({ nodes = [], edges = [] }) => {
  const incomingEdges = incomingEdgesByTarget(edges)
  return new Map(nodes.map((node) => readNodeMeta(node, incomingEdges.get(node.id))))
}

export const buildChoicesBySource = ({ edges = [] }, nodeMeta) => {
  const outgoingEdges = outgoingEdgesBySource(edges)
  const choicesBySource = new Map()

  outgoingEdges.forEach((sourceEdges, sourceId) => {
    const choices = sourceEdges.map((edge) => {
      const target = nodeMeta.get(edge.to)
      if (!target) {
        return null
      }

      return {
        ...target,
        answer: edge.label || target.answer || "",
        sourceId
      }
    }).filter(Boolean)

    if (choices.length > 0) {
      choicesBySource.set(sourceId, choices)
    }
  })

  return choicesBySource
}

export const buildRoute = (nodeMeta, nodeId) => {
  const route = []
  const seen = new Set()
  let currentId = nodeId

  while (currentId && !seen.has(currentId)) {
    seen.add(currentId)
    const current = nodeMeta.get(currentId)
    if (!current) {
      break
    }

    route.unshift(current)
    currentId = current.parentId
  }

  return route
}

export const activeRouteId = (state) => state.previewId || state.selectedId
