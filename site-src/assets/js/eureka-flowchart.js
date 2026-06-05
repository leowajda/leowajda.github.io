import { getHashValue, onReady } from "./dom.js"
import { bindFlowchartEvents } from "./eureka-flowchart-events.js"
import {
  createFlowchartNodeStateRenderer,
  queryFlowchartNodeButton
} from "./eureka-flowchart-node-state.js"
import { createFlowchartSelectionController } from "./eureka-flowchart-selection.js"
import {
  createFlowchartMetadata,
  createFlowchartState,
  resolveFlowchartNodeId
} from "./eureka-flowchart-state.js"
import {
  createGraph,
  loadX6,
  registerFlowchartNode
} from "./eureka-flowchart-x6.js"
import { createViewportController } from "./eureka-flowchart-viewport.js"
import { createZoomControls } from "./eureka-flowchart-zoom-controls.js"

const GRAPH_RENDER_FRAME_LIMIT = 12

const supportsHover = () =>
  typeof window.matchMedia === "function" && window.matchMedia("(hover: hover)").matches

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

const showEnhancedFlowchart = (root, zoomControls, viewport) => {
  root.classList.add("flowchart-workspace--rendered")
  zoomControls?.setHidden(false)
  zoomControls?.sync(viewport.state())
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
  const initialHashNodeId = resolveFlowchartNodeId(metadata, getHashValue())

  if (initialHashNodeId && metadata.nodeMeta.has(initialHashNodeId)) {
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
    nodeMeta: metadata.nodeMeta,
    state
  })
  const viewport = createViewportController(graph, surface, graphData, {
    onChange: (viewportState) => {
      zoomControls?.sync(viewportState)
    }
  })
  const graphRendered = await waitForGraphRender(root, metadata.rootId)
  if (!graphRendered) {
    nodeStateRenderer.disconnect()
    console.error("Flowchart graph did not render visible nodes. Keeping the static fallback visible.")
    return
  }

  const selection = createFlowchartSelectionController({
    root,
    inspector,
    inspectorContent,
    metadata,
    state,
    nodeStateRenderer,
    viewport,
    supportsHover: supportsHover()
  })

  zoomControls = createZoomControls(root, {
    onResetZoom: () => {
      selection.interruptViewportFocus()
      viewport.resetAuto({ selectedNodeId: selection.selectedId() })
    },
    onSetZoom: (scale) => {
      selection.interruptViewportFocus()
      viewport.setZoom(scale, { immediate: true })
    },
    onStepZoom: (direction) => {
      selection.interruptViewportFocus()
      viewport.stepZoom(direction)
    }
  })

  bindFlowchartEvents({
    surface,
    viewportElement,
    graph,
    metadata,
    selection,
    viewport,
    zoomControls
  })

  viewport.positionStart()

  if (initialHashNodeId && metadata.nodeMeta.has(initialHashNodeId)) {
    selection.commitSelection(initialHashNodeId, { updateHash: false, focus: false })
    viewport.focusNode(initialHashNodeId, { immediate: true })
    nodeStateRenderer.render()
    showEnhancedFlowchart(root, zoomControls, viewport)
    return
  }

  selection.hideInspector()
  nodeStateRenderer.render()
  showEnhancedFlowchart(root, zoomControls, viewport)
}

onReady(() => {
  document.querySelectorAll("[data-flowchart]").forEach((root) => {
    initializeFlowchart(root).catch((error) => {
      console.error(error)
    })
  })
})
