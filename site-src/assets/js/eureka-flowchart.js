import { getHashValue, onReady, replaceHashValue } from "./dom.js"
import { decorateInspector, renderMathIn } from "./eureka-flowchart-inspector.js"
import {
  activeRouteId,
  buildNodeMetaMap,
  buildRoute,
  createFlowchartState
} from "./eureka-flowchart-state.js"
import {
  createGraph,
  createViewportController,
  loadX6,
  registerFlowchartNode
} from "./eureka-flowchart-x6.js"

const replaceHash = (nodeId) => {
  replaceHashValue(nodeId)
}

const closestElement = (target, selector) =>
  target instanceof Element ? target.closest(selector) : null

const containsRelatedTarget = (element, relatedTarget) =>
  relatedTarget instanceof Node && element.contains(relatedTarget)

const queryTemplate = (root, nodeId) =>
  root.querySelector(`template[data-flowchart-template="${CSS.escape(nodeId)}"]`)

const queryNodeButton = (root, nodeId) =>
  root.querySelector(`[data-flowchart-node-id="${CSS.escape(nodeId)}"]`)

const readGraphData = (root) => {
  const script = root.querySelector("[data-flowchart-graph]")
  if (!script?.textContent) {
    return null
  }

  try {
    return JSON.parse(script.textContent)
  } catch (error) {
    console.error("Invalid flowchart graph JSON.", error)
    return null
  }
}

const buildChoicesBySource = ({ edges = [] }, nodeMeta) => {
  const choicesBySource = new Map()

  edges.forEach((edge) => {
    const sourceId = edge.from || ""
    const target = nodeMeta.get(edge.to)
    if (!sourceId || !target) {
      return
    }

    if (!choicesBySource.has(sourceId)) {
      choicesBySource.set(sourceId, [])
    }

    choicesBySource.get(sourceId).push({
      ...target,
      answer: edge.label || target.answer || "",
      sourceId
    })
  })

  return choicesBySource
}

const syncNodeDataState = (node, nextState) => {
  const data = node.getData() || {}
  if (
    data.selected === nextState.selected &&
    data.previewed === nextState.previewed &&
    data.path === nextState.path &&
    data.dimmed === nextState.dimmed
  ) {
    return
  }

  node.setData(nextState, { deep: false })
}

const initializeFlowchart = async (root) => {
  const surface = root.querySelector("[data-flowchart-surface]")
  const zoomControls = root.querySelector("[data-flowchart-zoom-controls]")
  const inspector = root.querySelector("[data-flowchart-inspector]")
  const inspectorContent = root.querySelector("[data-flowchart-inspector-content]")
  const graphData = readGraphData(root)

  if (!surface || !inspector || !inspectorContent || !graphData) {
    return
  }

  const nodeMeta = buildNodeMetaMap(graphData)
  const choicesBySource = buildChoicesBySource(graphData, nodeMeta)
  const nodeAliasMap = new Map(
    graphData.nodes.flatMap((node) =>
      (node.aliases || []).filter(Boolean).map((alias) => [alias, node.id])
    )
  )
  const resolveNodeId = (nodeId) =>
    nodeMeta.has(nodeId) ? nodeId : nodeAliasMap.get(nodeId) || nodeId
  const initialHashNodeId = resolveNodeId(getHashValue())

  if (initialHashNodeId && nodeMeta.has(initialHashNodeId)) {
    root.classList.remove("flowchart-workspace--empty")
  }

  const x6Url = root.dataset.flowchartX6Url || "/assets/vendor/x6/x6.min.js"
  const X6 = await loadX6(x6Url)
  registerFlowchartNode(X6)

  const graph = createGraph(X6, surface, graphData)
  const viewport = createViewportController(graph, surface, graphData)
  root.classList.add("flowchart-workspace--ready")
  const supportsHover = typeof window.matchMedia === "function" && window.matchMedia("(hover: hover)").matches
  const state = createFlowchartState()
  let focusSequence = 0

  const hideInspector = () => {
    inspector.hidden = true
    root.classList.add("flowchart-workspace--empty")
  }

  const renderInspector = (nodeId) => {
    const template = queryTemplate(root, nodeId)
    if (!template) {
      return
    }

    const route = buildRoute(nodeMeta, nodeId)
    const choices = choicesBySource.get(nodeId) || []
    const nextContent = template.content.cloneNode(true)
    decorateInspector(nextContent, {
      route,
      choices,
      activePanelName: state.activePanel,
      onActivePanelChange: (panelName) => {
        state.activePanel = panelName
      },
      onSelectRouteNode: (routeNodeId) => {
        commitSelection(routeNodeId, { focus: true })
      }
    })
    inspectorContent.replaceChildren(nextContent)
    renderMathIn(inspectorContent)
    inspector.hidden = false
    root.classList.remove("flowchart-workspace--empty")
  }

  const renderEdgeState = (routeEdgeTargets) => {
    graph.getEdges().forEach((edge) => {
      const edgeData = edge.getData() || {}
      const isPath = routeEdgeTargets.has(edgeData.to)
      const isDimmed = routeEdgeTargets.size > 0 && !isPath

      edge.attr("line/strokeWidth", isPath ? 5 : 3)
      edge.attr("line/opacity", isDimmed ? 0.34 : 1)
    })
  }

  const renderNodeState = () => {
    const route = buildRoute(nodeMeta, activeRouteId(state))
    const routeNodeIds = new Set(route.map((step) => step.id))
    const routeEdgeTargets = new Set(route.filter((step) => step.parentId).map((step) => step.id))
    const hasDecisionPath = routeNodeIds.size > 1

    root.classList.toggle("has-route", hasDecisionPath)

    graph.getNodes().forEach((node) => {
      const nodeId = node.id
      const button = queryNodeButton(root, nodeId)
      const isSelected = nodeId === state.selectedId
      const isPreviewed = nodeId === state.previewId
      const isPath = routeNodeIds.has(nodeId)
      const isDimmed = hasDecisionPath && !isPath

      syncNodeDataState(node, {
        selected: isSelected,
        previewed: isPreviewed,
        path: isPath,
        dimmed: isDimmed
      })
      button?.classList.toggle("is-selected", isSelected)
      button?.classList.toggle("is-previewed", isPreviewed)
      button?.classList.toggle("is-path", isPath)
      button?.classList.toggle("is-dimmed", isDimmed)
      button?.setAttribute("aria-pressed", isSelected ? "true" : "false")
      node.setZIndex(isSelected || isPreviewed ? 4 : 2)
    })

    renderEdgeState(routeEdgeTargets)
  }

  const scheduleNodeStateRender = () => {
    window.requestAnimationFrame(() => {
      renderNodeState()
    })
  }

  const scheduleViewportFocus = (nodeId, options = {}) => {
    const currentSequence = ++focusSequence
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        if (currentSequence !== focusSequence || state.selectedId !== nodeId) {
          return
        }

        viewport.focusNode(nodeId, options)
      })
    })
  }

  const commitSelection = (nodeId, { updateHash = true, focus = true, immediate = false } = {}) => {
    nodeId = resolveNodeId(nodeId)
    if (!nodeMeta.has(nodeId)) {
      return
    }

    state.selectedId = nodeId
    state.previewId = null
    renderInspector(nodeId)
    renderNodeState()
    scheduleNodeStateRender()

    if (focus) {
      scheduleViewportFocus(nodeId, { immediate })
    }

    if (updateHash) {
      replaceHash(nodeId)
    }
  }

  const clearSelection = ({ updateHash = true } = {}) => {
    focusSequence += 1
    state.selectedId = ""
    state.previewId = null
    viewport.cancel()
    hideInspector()
    renderNodeState()
    scheduleNodeStateRender()

    if (updateHash) {
      replaceHash("")
    }
  }

  const previewNode = (nodeId) => {
    nodeId = resolveNodeId(nodeId)
    if (!supportsHover || nodeId === state.selectedId || !nodeMeta.has(nodeId)) {
      return
    }

    state.previewId = nodeId
    renderInspector(nodeId)
    renderNodeState()
    scheduleNodeStateRender()
  }

  const clearPreview = () => {
    if (!supportsHover || !state.previewId) {
      return
    }

    state.previewId = null
    if (state.selectedId) {
      renderInspector(state.selectedId)
    } else {
      hideInspector()
    }
    renderNodeState()
    scheduleNodeStateRender()
  }

  graph.on("node:click", ({ node }) => {
    commitSelection(node.id)
  })

  graph.on("blank:click", () => {
    clearSelection()
  })

  graph.on("node:mouseenter", ({ node }) => {
    previewNode(node.id)
  })

  graph.on("node:mouseleave", () => {
    clearPreview()
  })

  surface.addEventListener("click", (event) => {
    const button = closestElement(event.target, "[data-flowchart-node]")
    if (button) {
      commitSelection(button.dataset.flowchartNodeId || "")
    }
  })

  surface.addEventListener("focusin", (event) => {
    const button = closestElement(event.target, "[data-flowchart-node]")
    if (button) {
      previewNode(button.dataset.flowchartNodeId || "")
    }
  })

  surface.addEventListener("focusout", (event) => {
    const button = closestElement(event.target, "[data-flowchart-node]")
    if (button && !containsRelatedTarget(button, event.relatedTarget)) {
      clearPreview()
    }
  })

  surface.addEventListener("wheel", (event) => {
    focusSequence += 1
    viewport.zoomFromWheel(event)
  }, { passive: false })

  surface.addEventListener("pointerdown", (event) => {
    if (event.button === 0 && !closestElement(event.target, "[data-flowchart-node]")) {
      focusSequence += 1
      viewport.cancel()
    }
  })

  zoomControls?.addEventListener("click", (event) => {
    const button = closestElement(event.target, "[data-flowchart-zoom]")
    if (!button) {
      return
    }

    focusSequence += 1
    viewport.zoomAction(button.dataset.flowchartZoom || "", { selectedNodeId: state.selectedId })
  })

  window.addEventListener("hashchange", () => {
    const hashNodeId = resolveNodeId(getHashValue())
    if (hashNodeId && nodeMeta.has(hashNodeId)) {
      if (hashNodeId === state.selectedId) {
        return
      }

      commitSelection(hashNodeId, { updateHash: false })
      return
    }

    clearSelection({ updateHash: false })
  })

  window.addEventListener("resize", () => {
    focusSequence += 1
    viewport.cancel()
    if (state.selectedId) {
      viewport.refocusSelected(state.selectedId)
    } else {
      viewport.positionStart()
    }
  })

  viewport.positionStart()

  if (initialHashNodeId && nodeMeta.has(initialHashNodeId)) {
    commitSelection(initialHashNodeId, { updateHash: false, immediate: true })
    return
  }

  hideInspector()
  renderNodeState()
  scheduleNodeStateRender()
}

onReady(() => {
  document.querySelectorAll("[data-flowchart]").forEach((root) => {
    initializeFlowchart(root).catch((error) => {
      console.error(error)
    })
  })
})
