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
  const nodeLabel = button.dataset.flowchartNodeLabel || button.dataset.flowchartNodeTitle || ""
  const nodeTitle = button.dataset.flowchartNodeTitle || nodeLabel
  const isDecision = button.dataset.flowchartNodeKind === "decision"

  return [nodeId, {
    id: nodeId,
    kind: button.dataset.flowchartNodeKind || "",
    title: nodeTitle,
    label: nodeLabel || nodeTitle,
    question: isDecision ? nodeLabel : nodeTitle,
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
