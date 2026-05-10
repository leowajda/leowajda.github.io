import { activeRouteId, buildRoute } from "./eureka-flowchart-state.js"

const nodeSelector = (nodeId) =>
  `[data-flowchart-node-id="${CSS.escape(nodeId)}"]`

export const queryFlowchartNodeButton = (root, nodeId) =>
  root.querySelector(nodeSelector(nodeId))

const mutationContainsFlowchartNode = (mutation) =>
  Array.from(mutation.addedNodes).some((node) => {
    if (!(node instanceof Element)) {
      return false
    }

    return node.matches("[data-flowchart-node]") || node.querySelector("[data-flowchart-node]")
  })

export const createFlowchartNodeStateRenderer = ({ root, surface, graph, nodeMeta, state }) => {
  let frameId = 0

  const renderEdgeState = (routeEdgeTargets) => {
    graph.getEdges().forEach((edge) => {
      const edgeData = edge.getData() || {}
      const isPath = routeEdgeTargets.has(edgeData.to)
      const isDimmed = routeEdgeTargets.size > 0 && !isPath

      edge.attr("line/strokeWidth", isPath ? 5 : 3)
      edge.attr("line/opacity", isDimmed ? 0.34 : 1)
    })
  }

  const render = () => {
    const route = buildRoute(nodeMeta, activeRouteId(state))
    const routeNodeIds = new Set(route.map((step) => step.id))
    const routeEdgeTargets = new Set(route.filter((step) => step.parentId).map((step) => step.id))
    const hasDecisionPath = routeNodeIds.size > 1

    root.classList.toggle("has-route", hasDecisionPath)

    graph.getNodes().forEach((node) => {
      const nodeId = node.id
      const button = queryFlowchartNodeButton(root, nodeId)
      const isSelected = nodeId === state.selectedId
      const isPreviewed = nodeId === state.previewId
      const isPath = routeNodeIds.has(nodeId)
      const isDimmed = hasDecisionPath && !isPath

      button?.classList.toggle("is-selected", isSelected)
      button?.classList.toggle("is-previewed", isPreviewed)
      button?.classList.toggle("is-path", isPath)
      button?.classList.toggle("is-dimmed", isDimmed)
      button?.setAttribute("aria-pressed", isSelected ? "true" : "false")
    })

    renderEdgeState(routeEdgeTargets)
  }

  const schedule = () => {
    if (frameId) {
      return
    }

    frameId = window.requestAnimationFrame(() => {
      frameId = 0
      render()
    })
  }

  const observer = new MutationObserver((mutations) => {
    if (mutations.some(mutationContainsFlowchartNode)) {
      schedule()
    }
  })

  observer.observe(surface, { childList: true, subtree: true })

  return {
    disconnect() {
      if (frameId) {
        window.cancelAnimationFrame(frameId)
        frameId = 0
      }
      observer.disconnect()
    },
    render,
    schedule
  }
}
