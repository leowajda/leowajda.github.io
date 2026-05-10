import { getHashValue, onReady, replaceHashValue } from "./dom.js"
import { decorateInspector, renderMathIn } from "./eureka-flowchart-inspector.js"
import {
  createFlowchartNodeStateRenderer,
  queryFlowchartNodeButton
} from "./eureka-flowchart-node-state.js"
import {
  buildRoute,
  createFlowchartMetadata,
  createFlowchartState
} from "./eureka-flowchart-state.js"
import {
  createGraph,
  loadX6,
  registerFlowchartNode
} from "./eureka-flowchart-x6.js"
import { createViewportController } from "./eureka-flowchart-viewport.js"
import { createZoomControls } from "./eureka-flowchart-zoom-controls.js"

const GRAPH_RENDER_FRAME_LIMIT = 12

const replaceHash = (nodeId) => {
  replaceHashValue(nodeId)
}

const closestElement = (target, selector) =>
  target instanceof Element ? target.closest(selector) : null

const containsRelatedTarget = (element, relatedTarget) =>
  relatedTarget instanceof Node && element.contains(relatedTarget)

const queryTemplate = (root, nodeId) =>
  root.querySelector(`template[data-flowchart-template="${CSS.escape(nodeId)}"]`)

const nextAnimationFrame = () =>
  new Promise((resolve) => {
    window.requestAnimationFrame(resolve)
  })

const isMeasurableElement = (element) => {
  if (!element) {
    return false
  }

  const rect = element.getBoundingClientRect()
  return rect.width > 0 && rect.height > 0
}

const waitForGraphRender = async (root, rootId) => {
  for (let attempt = 0; attempt < GRAPH_RENDER_FRAME_LIMIT; attempt += 1) {
    await nextAnimationFrame()

    const rootNode = rootId ? queryFlowchartNodeButton(root, rootId) : null
    const renderedNode = rootNode || root.querySelector("[data-flowchart-node]")
    if (isMeasurableElement(renderedNode)) {
      return true
    }
  }

  return false
}

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

const initializeFlowchart = async (root) => {
  const surface = root.querySelector("[data-flowchart-surface]")
  const viewportElement = root.querySelector("[data-flowchart-viewport]")
  const inspector = root.querySelector("[data-flowchart-inspector]")
  const inspectorContent = root.querySelector("[data-flowchart-inspector-content]")
  const graphData = readGraphData(root)

  if (!surface || !inspector || !inspectorContent || !graphData) {
    return
  }

  const metadata = createFlowchartMetadata(graphData)
  const { aliasMap, choicesBySource, nodeMeta, rootId } = metadata
  const resolveNodeId = (nodeId) =>
    nodeMeta.has(nodeId) ? nodeId : aliasMap.get(nodeId) || nodeId
  const initialHashNodeId = resolveNodeId(getHashValue())

  if (initialHashNodeId && nodeMeta.has(initialHashNodeId)) {
    root.classList.remove("flowchart-workspace--empty")
  }

  const x6Url = root.dataset.flowchartX6Url || "/assets/vendor/x6/x6.min.js"
  const X6 = await loadX6(x6Url)
  registerFlowchartNode(X6)

  const graph = createGraph(X6, surface, graphData)
  let zoomControls = null
  const state = createFlowchartState()
  const nodeStateRenderer = createFlowchartNodeStateRenderer({
    root,
    surface,
    graph,
    nodeMeta,
    state
  })
  const viewport = createViewportController(graph, surface, graphData, {
    onChange: (viewportState) => {
      zoomControls?.sync(viewportState)
    }
  })
  const graphRendered = await waitForGraphRender(root, rootId)
  if (!graphRendered) {
    nodeStateRenderer.disconnect()
    console.error("Flowchart graph did not render visible nodes. Keeping the static fallback visible.")
    return
  }

  const supportsHover = typeof window.matchMedia === "function" && window.matchMedia("(hover: hover)").matches
  let focusSequence = 0
  zoomControls = createZoomControls(root, {
    onResetZoom: () => {
      focusSequence += 1
      viewport.resetAuto({ selectedNodeId: state.selectedId })
    },
    onSetZoom: (scale) => {
      focusSequence += 1
      viewport.setZoom(scale, { immediate: true })
    },
    onStepZoom: (direction) => {
      focusSequence += 1
      viewport.stepZoom(direction)
    }
  })

  const showEnhancedFlowchart = () => {
    root.classList.add("flowchart-workspace--rendered")
    zoomControls?.setHidden(false)
    zoomControls?.sync(viewport.state())
  }

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
    nodeStateRenderer.render()

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
    nodeStateRenderer.render()

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
    nodeStateRenderer.render()
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
    nodeStateRenderer.render()
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
    if (button && event.detail === 0) {
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
    if (viewport.zoomFromWheel(event)) {
      focusSequence += 1
    }
  }, { passive: false })

  surface.addEventListener("pointerdown", (event) => {
    if (event.button === 0 && !closestElement(event.target, "[data-flowchart-node]")) {
      focusSequence += 1
      viewport.cancel()
    }
  })

  viewportElement?.addEventListener("keydown", (event) => {
    if (zoomControls?.contains(event.target) || event.altKey || event.ctrlKey || event.metaKey) {
      return
    }

    if (event.key === "+" || event.key === "=") {
      event.preventDefault()
      focusSequence += 1
      viewport.stepZoom(1)
    } else if (event.key === "-") {
      event.preventDefault()
      focusSequence += 1
      viewport.stepZoom(-1)
    } else if (event.key === "0") {
      event.preventDefault()
      focusSequence += 1
      viewport.resetAuto({ selectedNodeId: state.selectedId })
    }
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
      viewport.positionStart({ preserveScale: viewport.isManual() })
    }
  })

  viewport.positionStart()

  if (initialHashNodeId && nodeMeta.has(initialHashNodeId)) {
    commitSelection(initialHashNodeId, { updateHash: false, focus: false })
    viewport.focusNode(initialHashNodeId, { immediate: true })
    nodeStateRenderer.render()
    showEnhancedFlowchart()
    return
  }

  hideInspector()
  nodeStateRenderer.render()
  showEnhancedFlowchart()
}

onReady(() => {
  document.querySelectorAll("[data-flowchart]").forEach((root) => {
    initializeFlowchart(root).catch((error) => {
      console.error(error)
    })
  })
})
