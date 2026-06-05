const FLOWCHART_NODE_SHAPE = "eureka-flowchart-node"

let x6LoadPromise = null
let nodeShapeRegistered = false

const capitalize = (value) => (value ? value.charAt(0).toUpperCase() + value.slice(1) : "")
const usesMobileGraphLayout = () => window.matchMedia("(max-width: 820px)").matches
const graphPayload = (graphData) =>
  graphData.x6?.[usesMobileGraphLayout() ? "mobile" : "desktop"] || graphData

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

  graph.fromJSON(graphPayload(graphData))
  return graph
}
