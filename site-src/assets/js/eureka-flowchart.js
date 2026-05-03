import { getHashValue, onReady, replaceHashValue } from "./dom.js"
import { decorateInspector, renderMathIn } from "./eureka-flowchart-inspector.js"
import { activeRouteId, buildNodeMetaMap, buildRoute, createFlowchartState } from "./eureka-flowchart-state.js"

const FLOWCHART_NODE_SHAPE = "eureka-flowchart-node"
const FLOWCHART_CONTENT_PADDING = 24
const MOBILE_GRAPH_X_COMPRESSION = 0.5
const ZOOM_MAX = 1.45
const ZOOM_MIN = 0.35
const ZOOM_STEP = 0.14
const ZOOM_ANIMATION_MS = 180
const ROUTER_PADDING = 20
const MOBILE_ROUTER_PADDING = 10
const ROUTER_STEP = 20
const CONNECTOR_RADIUS = 34
const PORT_LABEL_ATTRS = {
  fill: "var(--text)",
  fontFamily: "monospace",
  fontSize: 28,
  fontWeight: 800,
  paintOrder: "stroke fill",
  stroke: "var(--surface)",
  strokeLinejoin: "round",
  strokeWidth: 10
}
const BRANCH_PORTS = {
  yes: {
    group: "outYes",
    text: "Yes"
  },
  no: {
    group: "outNo",
    text: "No"
  }
}
const INPUT_PORT_BY_SIDE = {
  bottom: "in-bottom",
  left: "in-left",
  right: "in-right",
  top: "in-top"
}
const INPUT_PORT_GROUPS = {
  bottom: "inBottom",
  left: "inLeft",
  right: "inRight",
  top: "inTop"
}
const PORT_GROUPS = {
  inBottom: {
    position: "bottom",
    attrs: {
      circle: {
        r: 0,
        magnet: false,
        opacity: 0
      }
    }
  },
  inLeft: {
    position: "left",
    attrs: {
      circle: {
        r: 0,
        magnet: false,
        opacity: 0
      }
    }
  },
  inRight: {
    position: "right",
    attrs: {
      circle: {
        r: 0,
        magnet: false,
        opacity: 0
      }
    }
  },
  inTop: {
    position: "top",
    attrs: {
      circle: {
        r: 0,
        magnet: false,
        opacity: 0
      }
    }
  },
  outNo: {
    position: "bottom",
    zIndex: 10,
    label: {
      position: {
        name: "bottom",
        args: {
          y: -22,
          attrs: {
            text: {
              ...PORT_LABEL_ATTRS,
              textAnchor: "middle"
            }
          }
        }
      }
    },
    attrs: {
      circle: {
        r: 8,
        class: "flowchart-port flowchart-port--no",
        fill: "var(--surface)",
        magnet: false,
        stroke: "var(--border)",
        strokeWidth: 3
      }
    }
  },
  outYes: {
    position: "right",
    zIndex: 10,
    label: {
      position: {
        name: "right",
        args: {
          x: 8,
          y: -22,
          attrs: {
            text: {
              ...PORT_LABEL_ATTRS,
              textAnchor: "start"
            }
          }
        }
      }
    },
    attrs: {
      circle: {
        r: 8,
        class: "flowchart-port flowchart-port--yes",
        fill: "var(--border)",
        magnet: false,
        stroke: "var(--border)",
        strokeWidth: 3
      }
    }
  }
}

let x6LoadPromise = null
let nodeShapeRegistered = false

const replaceHash = (nodeId) => {
  replaceHashValue(nodeId)
}

const closestElement = (target, selector) =>
  target instanceof Element ? target.closest(selector) : null

const containsRelatedTarget = (element, relatedTarget) =>
  relatedTarget instanceof Node && element.contains(relatedTarget)

const toNumber = (value, fallback = 0) => {
  const parsed = Number.parseFloat(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

const capitalize = (value) => (value ? value.charAt(0).toUpperCase() + value.slice(1) : "")

const branchName = (label) => label.trim().toLowerCase()

const branchKey = (edge) => (BRANCH_PORTS[branchName(edge.label)] ? branchName(edge.label) : "no")

const queryTemplate = (root, nodeId) =>
  root.querySelector(`template[data-flowchart-template="${CSS.escape(nodeId)}"]`)

const queryNodeButton = (root, nodeId) =>
  root.querySelector(`[data-flowchart-node-id="${CSS.escape(nodeId)}"]`)

const loadX6 = (url) => {
  if (window.X6?.Graph) {
    return Promise.resolve(window.X6)
  }

  if (x6LoadPromise) {
    return x6LoadPromise
  }

  x6LoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script")
    script.src = url
    script.async = true
    script.onload = () => {
      if (window.X6?.Graph) {
        resolve(window.X6)
        return
      }
      reject(new Error("X6 loaded without exposing window.X6.Graph."))
    }
    script.onerror = () => {
      reject(new Error(`Unable to load X6 from ${url}.`))
    }
    document.head.append(script)
  })

  return x6LoadPromise
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

const registerFlowchartNode = ({ Shape }) => {
  if (nodeShapeRegistered) {
    return
  }

  Shape.HTML.register({
    shape: FLOWCHART_NODE_SHAPE,
    html(cell) {
      const data = cell.getData() || {}
      const kind = data.kind || "solution"
      const text = data.text || data.label || ""
      const label = data.label || text
      const isSelected = data.selected === true
      const isPreviewed = data.previewed === true
      const isPath = data.path === true
      const isDimmed = data.dimmed === true
      const button = document.createElement("button")
      const labelElement = document.createElement("span")

      button.type = "button"
      button.className = `flowchart-node flowchart-node--${kind}`
      button.classList.toggle("is-selected", isSelected)
      button.classList.toggle("is-previewed", isPreviewed)
      button.classList.toggle("is-path", isPath)
      button.classList.toggle("is-dimmed", isDimmed)
      button.dataset.flowchartNode = ""
      button.dataset.flowchartNodeId = data.id || ""
      button.dataset.flowchartNodeAliases = Array.isArray(data.aliases) ? data.aliases.join(" ") : ""
      button.dataset.flowchartNodeKind = kind
      button.dataset.flowchartNodeText = text
      button.dataset.flowchartNodeCanvasText = label
      button.setAttribute("aria-label", `${capitalize(kind)} node: ${text.replaceAll("$", "")}`)
      button.setAttribute("aria-pressed", isSelected ? "true" : "false")

      labelElement.className = "flowchart-node__label"
      labelElement.textContent = label
      button.append(labelElement)

      return button
    },
    effect: ["data"]
  })

  nodeShapeRegistered = true
}

const nodeCenter = (node) => ({
  x: node.x + node.width / 2,
  y: node.y + node.height / 2
})

const targetSide = (from, to) => {
  if (!from || !to) {
    return "top"
  }

  const source = nodeCenter(from)
  const target = nodeCenter(to)
  const dx = target.x - source.x
  const dy = target.y - source.y

  if (Math.abs(dx) > Math.abs(dy) * 0.7) {
    return dx >= 0 ? "left" : "right"
  }

  return dy >= 0 ? "top" : "bottom"
}

const edgePorts = (edge, nodeIndex) => {
  const from = nodeIndex.get(edge.from)
  const to = nodeIndex.get(edge.to)
  const sourceBranch = branchKey(edge)
  const targetDirection = targetSide(from, to)

  return {
    sourceBranch,
    targetDirection,
    sourcePort: `out-${sourceBranch}`,
    targetPort: INPUT_PORT_BY_SIDE[targetDirection]
  }
}

const branchLabelsByNode = (edges) =>
  edges.reduce((result, edge) => {
    const branch = branchName(edge.label)
    if (!BRANCH_PORTS[branch]) {
      return result
    }

    if (!result.has(edge.from)) {
      result.set(edge.from, new Set())
    }
    result.get(edge.from).add(branch)
    return result
  }, new Map())

const buildNodePorts = (node, outgoingBranches) => ({
  groups: PORT_GROUPS,
  items: [
    ...Object.entries(INPUT_PORT_GROUPS).map(([side, group]) => ({
      id: INPUT_PORT_BY_SIDE[side],
      group
    })),
    ...[...(outgoingBranches.get(node.id) || [])].map((branch) => {
      const branchPort = BRANCH_PORTS[branch]
      return {
        id: `out-${branch}`,
        group: branchPort.group,
        attrs: {
          text: {
            text: branchPort.text
          }
        }
      }
    })
  ]
})

const transformNodeGeometry = (node, { compressX }) => ({
  ...node,
  x: compressX ? Math.round(node.x * MOBILE_GRAPH_X_COMPRESSION) : node.x
})

const buildX6Data = (graphData, { compressX = false } = {}) => {
  const nodes = graphData.nodes.map((node) => transformNodeGeometry(node, { compressX }))
  const nodeIndex = new Map(nodes.map((node) => [node.id, node]))
  const outgoingBranches = branchLabelsByNode(graphData.edges)
  const routerPadding = compressX ? MOBILE_ROUTER_PADDING : ROUTER_PADDING

  return {
    nodes: nodes.map((node) => ({
      id: node.id,
      shape: FLOWCHART_NODE_SHAPE,
      x: node.x,
      y: node.y,
      width: node.width,
      height: node.height,
      ports: buildNodePorts(node, outgoingBranches),
      zIndex: 2,
      data: node
    })),
    edges: graphData.edges.map((edge) => {
      const ports = edgePorts(edge, nodeIndex)

      return {
        id: edge.id,
        shape: "edge",
        source: { cell: edge.from, port: ports.sourcePort },
        target: { cell: edge.to, port: ports.targetPort },
        router: {
          name: "manhattan",
          args: {
            padding: routerPadding,
            step: ROUTER_STEP
          }
        },
        connector: {
          name: "rounded",
          args: {
            radius: CONNECTOR_RADIUS
          }
        },
        zIndex: 1,
        data: edge,
        attrs: {
          line: {
            fill: "none",
            stroke: "var(--border)",
            strokeWidth: 3,
            strokeLinecap: "round",
            strokeLinejoin: "round",
            targetMarker: null
          },
          wrap: {
            strokeWidth: 22
          }
        }
      }
    })
  }
}

const createGraph = ({ Graph }, surface, graphData) => {
  const graph = new Graph({
    container: surface,
    autoResize: true,
    background: {
      color: "var(--surface)"
    },
    grid: {
      size: 1,
      visible: false
    },
    interacting: {
      nodeMovable: false,
      magnetConnectable: false,
      edgeMovable: false,
      edgeLabelMovable: false,
      arrowheadMovable: false,
      vertexMovable: false,
      vertexAddable: false,
      vertexDeletable: false
    },
    panning: {
      enabled: true,
      eventTypes: ["leftMouseDown"]
    },
    mousewheel: {
      enabled: true,
      modifiers: ["ctrl", "meta"],
      minScale: ZOOM_MIN,
      maxScale: ZOOM_MAX,
      factor: 1.05,
      zoomAtMousePosition: true
    }
  })

  graph.fromJSON(buildX6Data(graphData, { compressX: usesMobileGraphLayout() }))
  return graph
}

const preferredScale = (graphData) => {
  const chart = graphData.chart || {}
  const desktopScale = toNumber(chart.scale_desktop, 1)
  const mobileScale = toNumber(chart.scale_mobile, desktopScale)
  return window.matchMedia("(max-width: 820px)").matches ? mobileScale : desktopScale
}

const usesMobileGraphLayout = () => window.matchMedia("(max-width: 820px)").matches

const syncGraphScale = (graph, graphData) => {
  graph.zoomTo(preferredScale(graphData), { maxScale: ZOOM_MAX, minScale: ZOOM_MIN })
}

const viewportCenter = (surface) => ({
  x: surface.clientWidth / 2,
  y: surface.clientHeight / 2
})

const clampZoom = (scale) => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, scale))

const currentGraphScale = (graph) => {
  const zoom = graph.zoom()
  if (Number.isFinite(zoom)) {
    return zoom
  }

  return toNumber(graph.scale()?.sx, 1)
}

const prefersReducedMotion = () =>
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches

const easeOutCubic = (progress) => 1 - ((1 - progress) ** 3)

const createZoomAnimator = (graph, surface) => {
  let frameId = 0

  const cancel = () => {
    if (frameId) {
      window.cancelAnimationFrame(frameId)
      frameId = 0
    }
  }

  const apply = (scale, center) => {
    graph.zoomTo(clampZoom(scale), { center, maxScale: ZOOM_MAX, minScale: ZOOM_MIN })
  }

  const to = (targetScale) => {
    const startScale = currentGraphScale(graph)
    const endScale = clampZoom(targetScale)
    const center = viewportCenter(surface)

    cancel()

    if (prefersReducedMotion() || Math.abs(endScale - startScale) < 0.001) {
      apply(endScale, center)
      return
    }

    const startedAt = window.performance.now()
    const step = (now) => {
      const progress = Math.min(1, (now - startedAt) / ZOOM_ANIMATION_MS)
      const easedProgress = easeOutCubic(progress)
      apply(startScale + ((endScale - startScale) * easedProgress), center)

      if (progress < 1) {
        frameId = window.requestAnimationFrame(step)
      } else {
        frameId = 0
      }
    }

    frameId = window.requestAnimationFrame(step)
  }

  return {
    by(delta) {
      to(currentGraphScale(graph) + delta)
    },
    cancel,
    to
  }
}

const zoomGraph = (zoomAnimator, graphData, action) => {
  if (action === "in") {
    zoomAnimator.by(ZOOM_STEP)
    return
  }

  if (action === "out") {
    zoomAnimator.by(-ZOOM_STEP)
    return
  }

  if (action === "reset") {
    zoomAnimator.to(preferredScale(graphData))
  }
}

const positionGraphStart = (graph) => {
  graph.positionContent("top-left")
  graph.translateBy(FLOWCHART_CONTENT_PADDING, FLOWCHART_CONTENT_PADDING)
}

const positionInitialNode = (graph, nodeId, surface) => {
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      const node = graph.getNodes().find((entry) => entry.id === nodeId)
      if (!node) {
        return
      }

      const bbox = node.getBBox()
      const scale = currentGraphScale(graph)
      graph.translate(
        surface.clientWidth / 2 - (bbox.x + bbox.width / 2) * scale,
        surface.clientHeight / 2 - (bbox.y + bbox.height / 2) * scale
      )
    })
  })
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
  const zoomAnimator = createZoomAnimator(graph, surface)
  const supportsHover = typeof window.matchMedia === "function" && window.matchMedia("(hover: hover)").matches
  const state = createFlowchartState()

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

  const commitSelection = (nodeId, { updateHash = true } = {}) => {
    nodeId = resolveNodeId(nodeId)
    if (!nodeMeta.has(nodeId)) {
      return
    }

    state.selectedId = nodeId
    state.previewId = null
    renderInspector(nodeId)
    renderNodeState()
    scheduleNodeStateRender()

    if (updateHash) {
      replaceHash(nodeId)
    }
  }

  const clearSelection = ({ updateHash = true } = {}) => {
    state.selectedId = ""
    state.previewId = null
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

  zoomControls?.addEventListener("click", (event) => {
    const button = closestElement(event.target, "[data-flowchart-zoom]")
    if (!button) {
      return
    }

    zoomGraph(zoomAnimator, graphData, button.dataset.flowchartZoom || "")
  })

  window.addEventListener("hashchange", () => {
    const hashNodeId = resolveNodeId(getHashValue())
    if (hashNodeId && nodeMeta.has(hashNodeId)) {
      commitSelection(hashNodeId, { updateHash: false })
      return
    }

    clearSelection({ updateHash: false })
  })

  window.addEventListener("resize", () => {
    zoomAnimator.cancel()
    syncGraphScale(graph, graphData)
    if (!state.selectedId) {
      positionGraphStart(graph)
    }
  })

  syncGraphScale(graph, graphData)
  positionGraphStart(graph)

  if (initialHashNodeId && nodeMeta.has(initialHashNodeId)) {
    commitSelection(initialHashNodeId, { updateHash: false })
    positionInitialNode(graph, initialHashNodeId, surface)
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
