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
  yes: { group: "outYes", text: "Yes" },
  no: { group: "outNo", text: "No" }
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
  inBottom: { position: "bottom", attrs: { circle: { r: 0, magnet: false, opacity: 0 } } },
  inLeft: { position: "left", attrs: { circle: { r: 0, magnet: false, opacity: 0 } } },
  inRight: { position: "right", attrs: { circle: { r: 0, magnet: false, opacity: 0 } } },
  inTop: { position: "top", attrs: { circle: { r: 0, magnet: false, opacity: 0 } } },
  outNo: {
    position: "bottom",
    zIndex: 10,
    label: {
      position: {
        name: "bottom",
        args: {
          y: -22,
          attrs: { text: { ...PORT_LABEL_ATTRS, textAnchor: "middle" } }
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
          attrs: { text: { ...PORT_LABEL_ATTRS, textAnchor: "start" } }
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

const toNumber = (value, fallback = 0) => {
  const parsed = Number.parseFloat(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

const capitalize = (value) => (value ? value.charAt(0).toUpperCase() + value.slice(1) : "")

const branchName = (label) => label.trim().toLowerCase()

const branchKey = (edge) => (BRANCH_PORTS[branchName(edge.label)] ? branchName(edge.label) : "no")

const usesMobileGraphLayout = () => window.matchMedia("(max-width: 820px)").matches

const preferredScale = (graphData) => {
  const chart = graphData.chart || {}
  const desktopScale = toNumber(chart.scale_desktop, 1)
  const mobileScale = toNumber(chart.scale_mobile, desktopScale)
  return usesMobileGraphLayout() ? mobileScale : desktopScale
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
    ...[...(outgoingBranches.get(node.id) || [])].map((branch) => ({
      id: `out-${branch}`,
      group: BRANCH_PORTS[branch].group,
      attrs: { text: { text: BRANCH_PORTS[branch].text } }
    }))
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
        router: { name: "manhattan", args: { padding: routerPadding, step: ROUTER_STEP } },
        connector: { name: "rounded", args: { radius: CONNECTOR_RADIUS } },
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
          wrap: { strokeWidth: 22 }
        }
      }
    })
  }
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

export const loadX6 = (url) => {
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

export const registerFlowchartNode = ({ Shape }) => {
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
      const button = document.createElement("button")
      const labelElement = document.createElement("span")

      button.type = "button"
      button.className = `flowchart-node flowchart-node--${kind}`
      button.classList.toggle("is-selected", data.selected === true)
      button.classList.toggle("is-previewed", data.previewed === true)
      button.classList.toggle("is-path", data.path === true)
      button.classList.toggle("is-dimmed", data.dimmed === true)
      button.dataset.flowchartNode = ""
      button.dataset.flowchartNodeId = data.id || ""
      button.dataset.flowchartNodeAliases = Array.isArray(data.aliases) ? data.aliases.join(" ") : ""
      button.dataset.flowchartNodeKind = kind
      button.dataset.flowchartNodeText = text
      button.dataset.flowchartNodeCanvasText = label
      button.setAttribute("aria-label", `${capitalize(kind)} node: ${text.replaceAll("$", "")}`)
      button.setAttribute("aria-pressed", data.selected === true ? "true" : "false")

      labelElement.className = "flowchart-node__label"
      labelElement.textContent = label
      button.append(labelElement)

      return button
    },
    effect: ["data"]
  })

  nodeShapeRegistered = true
}

export const createGraph = ({ Graph }, surface, graphData) => {
  const graph = new Graph({
    container: surface,
    autoResize: true,
    background: { color: "var(--surface)" },
    grid: { size: 1, visible: false },
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
      minScale: ZOOM_MIN,
      maxScale: ZOOM_MAX,
      factor: 1.05,
      zoomAtMousePosition: true
    }
  })

  graph.fromJSON(buildX6Data(graphData, { compressX: usesMobileGraphLayout() }))
  return graph
}

export const syncGraphScale = (graph, graphData) => {
  graph.zoomTo(preferredScale(graphData), { maxScale: ZOOM_MAX, minScale: ZOOM_MIN })
}

export const createZoomAnimator = (graph, surface) => {
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
      apply(startScale + ((endScale - startScale) * easeOutCubic(progress)), center)

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

export const zoomGraph = (zoomAnimator, graphData, action) => {
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

export const positionGraphStart = (graph) => {
  graph.positionContent("top-left")
  graph.translateBy(FLOWCHART_CONTENT_PADDING, FLOWCHART_CONTENT_PADDING)
}

export const positionInitialNode = (graph, nodeId, surface) => {
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
