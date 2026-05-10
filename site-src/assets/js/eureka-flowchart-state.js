export const createFlowchartState = () => ({
  selectedId: "",
  previewId: null,
  activePanel: "summary"
})

const objectRecordMap = (record) => {
  if (!record || typeof record !== "object" || Array.isArray(record)) {
    return new Map()
  }

  return new Map(Object.entries(record))
}

const buildRootId = ({ rootId = "", nodes = [] }) => rootId || nodes[0]?.id || ""

export const createFlowchartMetadata = (graphData = {}) => {
  return {
    aliasMap: objectRecordMap(graphData.aliasMap),
    choicesBySource: objectRecordMap(graphData.choicesBySource),
    nodeMeta: objectRecordMap(graphData.nodeMeta),
    rootId: buildRootId(graphData)
  }
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
