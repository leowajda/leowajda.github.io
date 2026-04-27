import { getHashValue, onReady, replaceHashValue } from "./dom.js"
import { parseNumber, queryNodeButton, queryTemplate } from "./eureka-flowchart-dom.js"
import { decorateInspector, renderMathIn } from "./eureka-flowchart-inspector.js"
import { attachFlowchartPan } from "./eureka-flowchart-pan.js"
import { activeRouteId, buildNodeMetaMap, buildRoute, createFlowchartState } from "./eureka-flowchart-state.js"
import { createFlowchartViewport } from "./eureka-flowchart-viewport.js"

const replaceHash = (nodeId) => {
  replaceHashValue(nodeId)
}

const closestElement = (target, selector) =>
  target instanceof Element ? target.closest(selector) : null

const containsRelatedTarget = (element, relatedTarget) =>
  relatedTarget instanceof Node && element.contains(relatedTarget)

const initializeFlowchart = (root) => {
  const viewport = root.querySelector("[data-flowchart-viewport]")
  const scaled = root.querySelector("[data-flowchart-scaled]")
  const surface = root.querySelector("[data-flowchart-surface]")
  const inspector = root.querySelector("[data-flowchart-inspector]")
  const inspectorContent = root.querySelector("[data-flowchart-inspector-content]")
  const nodeButtons = Array.from(root.querySelectorAll("[data-flowchart-node]"))
  const edgeGroups = Array.from(root.querySelectorAll("[data-flowchart-edge]"))

  if (!viewport || !scaled || !surface || !inspector || !inspectorContent || nodeButtons.length === 0) {
    return
  }

  const chartWidth = parseNumber(root.dataset.flowchartWidth)
  const chartHeight = parseNumber(root.dataset.flowchartHeight)
  const desktopScale = parseNumber(root.dataset.flowchartScaleDesktop, 1)
  const mobileScale = parseNumber(root.dataset.flowchartScaleMobile, desktopScale)
  const supportsHover = typeof window.matchMedia === "function" && window.matchMedia("(hover: hover)").matches
  const nodeMeta = buildNodeMetaMap(nodeButtons)
  const state = createFlowchartState(desktopScale)
  const viewportController = createFlowchartViewport({
    root,
    viewport,
    scaled,
    chartWidth,
    chartHeight,
    desktopScale,
    mobileScale,
    state
  })

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
    const nextContent = template.content.cloneNode(true)
    decorateInspector(nextContent, {
      route,
      activePanelName: state.activePanel,
      onActivePanelChange: (panelName) => {
        state.activePanel = panelName
      },
      onSelectRouteNode: (routeNodeId) => {
        commitSelection(routeNodeId)
      }
    })
    inspectorContent.replaceChildren(nextContent)
    renderMathIn(inspectorContent)
    inspector.hidden = false
    root.classList.remove("flowchart-workspace--empty")
  }

  const renderNodeState = () => {
    const route = buildRoute(nodeMeta, activeRouteId(state))
    const routeNodeIds = new Set(route.map((step) => step.id))
    const routeEdgeTargets = new Set(route.filter((step) => step.parentId).map((step) => step.id))

    root.classList.toggle("has-route", routeNodeIds.size > 0)

    nodeButtons.forEach((button) => {
      const nodeId = button.dataset.flowchartNodeId || ""
      const isSelected = nodeId === state.selectedId
      const isPreviewed = nodeId === state.previewId
      const isPath = routeNodeIds.has(nodeId)
      const isDimmed = routeNodeIds.size > 0 && !isPath

      button.classList.toggle("is-selected", isSelected)
      button.classList.toggle("is-previewed", isPreviewed)
      button.classList.toggle("is-path", isPath)
      button.classList.toggle("is-dimmed", isDimmed)
      button.setAttribute("aria-pressed", isSelected ? "true" : "false")
    })

    edgeGroups.forEach((edgeGroup) => {
      const edgeTargetId = edgeGroup.dataset.flowchartEdgeTo || ""
      const isPath = routeEdgeTargets.has(edgeTargetId)
      const isDimmed = routeEdgeTargets.size > 0 && !isPath

      edgeGroup.classList.toggle("is-path", isPath)
      edgeGroup.classList.toggle("is-dimmed", isDimmed)
    })
  }

  const centerNode = (nodeId, behavior = "smooth") => {
    const button = queryNodeButton(root, nodeId)
    if (!button) {
      return
    }

    viewportController.centerElement(button, behavior)
  }

  const commitSelection = (nodeId, { scroll = true, updateHash = true } = {}) => {
    const nextButton = queryNodeButton(root, nodeId)
    if (!nextButton) {
      return
    }

    state.selectedId = nodeId
    state.previewId = null
    renderInspector(nodeId)
    renderNodeState()

    if (scroll) {
      centerNode(nodeId)
    }

    if (updateHash) {
      replaceHash(nodeId)
    }
  }

  const clearSelection = ({ updateHash = true } = {}) => {
    state.selectedId = ""
    state.previewId = null
    hideInspector()
    renderNodeState()

    if (updateHash) {
      replaceHash("")
    }
  }

  const previewNode = (nodeId) => {
    if (!supportsHover || state.isDragging || nodeId === state.selectedId) {
      return
    }

    if (!queryNodeButton(root, nodeId)) {
      return
    }

    state.previewId = nodeId
    renderInspector(nodeId)
    renderNodeState()
  }

  const clearPreview = () => {
    if (!supportsHover || state.isDragging || !state.previewId) {
      return
    }

    state.previewId = null
    if (state.selectedId) {
      renderInspector(state.selectedId)
    } else {
      hideInspector()
    }
    renderNodeState()
  }

  const renderStableSelection = () => {
    if (state.selectedId) {
      renderInspector(state.selectedId)
    } else {
      hideInspector()
    }
  }

  attachFlowchartPan({
    root,
    viewport,
    viewportController,
    state,
    renderStableSelection,
    renderNodeState
  })

  viewport.addEventListener("click", (event) => {
    if (state.suppressClick) {
      event.preventDefault()
      event.stopPropagation()
      state.suppressClick = false
      return
    }

    if (event.target instanceof Element && event.target.closest("[data-flowchart-node]")) {
      return
    }

    clearSelection()
  }, true)

  viewport.addEventListener("click", (event) => {
    const button = closestElement(event.target, "[data-flowchart-node]")
    if (!button || state.suppressClick) {
      return
    }

    commitSelection(button.dataset.flowchartNodeId || "")
  })

  viewport.addEventListener("focusin", (event) => {
    const button = closestElement(event.target, "[data-flowchart-node]")
    if (button) {
      previewNode(button.dataset.flowchartNodeId || "")
    }
  })

  viewport.addEventListener("focusout", (event) => {
    if (closestElement(event.target, "[data-flowchart-node]")) {
      clearPreview()
    }
  })

  viewport.addEventListener("pointerover", (event) => {
    const button = closestElement(event.target, "[data-flowchart-node]")
    if (!button || containsRelatedTarget(button, event.relatedTarget)) {
      return
    }

    previewNode(button.dataset.flowchartNodeId || "")
  })

  viewport.addEventListener("pointerout", (event) => {
    const button = closestElement(event.target, "[data-flowchart-node]")
    if (!button || containsRelatedTarget(button, event.relatedTarget)) {
      return
    }

    clearPreview()
  })

  window.addEventListener("hashchange", () => {
    const hashNodeId = getHashValue()
    if (hashNodeId && queryNodeButton(root, hashNodeId)) {
      commitSelection(hashNodeId, { scroll: true, updateHash: false })
      return
    }

    clearSelection({ updateHash: false })
  })

  window.addEventListener("resize", () => {
    const previousScale = state.scale
    viewportController.syncScale()
    if (previousScale !== state.scale && state.selectedId) {
      centerNode(state.selectedId, "auto")
    }
  })

  viewportController.syncScale()

  const hashNodeId = getHashValue()
  if (hashNodeId && queryNodeButton(root, hashNodeId)) {
    commitSelection(hashNodeId, { scroll: false, updateHash: false })
    window.requestAnimationFrame(() => {
      centerNode(hashNodeId, "auto")
    })
    return
  }

  hideInspector()
  renderNodeState()
}

onReady(() => {
  document.querySelectorAll("[data-flowchart]").forEach((root) => {
    initializeFlowchart(root)
  })
})
