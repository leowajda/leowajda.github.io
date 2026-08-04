const FLOWCHART_NODE_SHAPE = "eureka-flowchart-node"
const MOBILE_GRAPH_X_COMPRESSION = 0.5
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

const capitalize = (value) => (value ? value.charAt(0).toUpperCase() + value.slice(1) : "")

const branchName = (label) => label.trim().toLowerCase()

const branchKey = (edge) => (BRANCH_PORTS[branchName(edge.label)] ? branchName(edge.label) : "no")

const usesMobileGraphLayout = () => window.matchMedia("(max-width: 820px)").matches

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
      button.dataset.flowchartNode = ""
      button.dataset.flowchartNodeId = data.id || ""
      button.setAttribute("aria-label", `${capitalize(kind)} node: ${text.replaceAll("$", "")}`)
      button.setAttribute("aria-pressed", "false")

      labelElement.className = "flowchart-node__label"
      labelElement.textContent = label
      button.append(labelElement)

      return button
    }
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
    }
  })

  graph.fromJSON(buildX6Data(graphData, { compressX: usesMobileGraphLayout() }))
  return graph
}
