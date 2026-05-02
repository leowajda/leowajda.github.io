export const createFlowchartState = (initialScale) => ({
  scale: initialScale,
  selectedId: "",
  previewId: null,
  activePanel: "summary",
  dragStartX: 0,
  dragStartY: 0,
  dragStartLeft: 0,
  dragStartTop: 0,
  pointerId: null,
  pointerDown: false,
  isDragging: false,
  suppressClick: false
})

const readNodeMeta = (button) => {
  const nodeId = button.dataset.flowchartNodeId || ""
  const nodeText = button.dataset.flowchartNodeText || button.dataset.flowchartNodeCanvasText || ""
  const nodeCanvasText = button.dataset.flowchartNodeCanvasText || nodeText
  const isDecision = button.dataset.flowchartNodeKind === "decision"

  return [nodeId, {
    id: nodeId,
    kind: button.dataset.flowchartNodeKind || "",
    text: nodeText,
    title: nodeText,
    label: nodeCanvasText,
    question: isDecision ? nodeText : "",
    parentId: button.dataset.flowchartParentId || "",
    answer: button.dataset.flowchartParentAnswer || ""
  }]
}

export const buildNodeMetaMap = (nodeButtons) => new Map(nodeButtons.map(readNodeMeta))

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
