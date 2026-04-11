import {
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  type SimulationNodeDatum
} from "d3-force"

const svgNamespace = "http://www.w3.org/2000/svg"

type SourceGraphNode = {
  readonly id: string
  readonly label: string
  readonly url: string
}

type SourceGraphEdge = {
  readonly source: string
  readonly target: string
  readonly direction: "inbound" | "outbound"
}

type RenderInput = {
  readonly currentNodeId: string
  readonly nodes: ReadonlyArray<SourceGraphNode>
  readonly edges: ReadonlyArray<SourceGraphEdge>
}

type GraphNodeDatum = SimulationNodeDatum & {
  readonly id: string
  readonly label: string
  readonly url: string
  readonly isCurrent: boolean
}

type GraphLinkDatum = {
  readonly source: string | GraphNodeDatum
  readonly target: string | GraphNodeDatum
  readonly direction: "inbound" | "outbound"
  readonly key: string
  readonly hasReciprocal: boolean
}

const nodeRadius = 40
const currentNodeRadius = 50
const labelOffsetY = 36
const labelHeight = 22
const boundaryInset = 6
const nodePaddingX = 30
const nodePaddingTop = 22
const nodePaddingBottom = 24

type GraphZone = {
  readonly left: number
  readonly right: number
  readonly top: number
  readonly bottom: number
  readonly width: number
  readonly height: number
}

const shortLabel = (label: string) => {
  const withoutExtension = label.replace(/\.[a-z0-9]+$/i, "")
  return withoutExtension.length > 22 ? `${withoutExtension.slice(0, 22)}…` : withoutExtension
}

export const mountForceGraph = (
  container: HTMLElement,
  input: RenderInput
): (() => void) => {
  const width = () => Math.max(container.clientWidth, 340)
  const height = () => Math.max(container.clientHeight, 240)
  const zone = (): GraphZone => {
    const w = width()
    const h = height()
    const right = w - nodePaddingX
    const desiredLeft = Math.max(w * 0.34, 160)
    const minWidth = 280
    const left = Math.max(nodePaddingX, Math.min(desiredLeft, right - minWidth))
    const top = nodePaddingTop
    const bottom = Math.max(top + 220, h - nodePaddingBottom)

    return {
      left,
      right,
      top,
      bottom,
      width: Math.max(1, right - left),
      height: Math.max(1, bottom - top)
    }
  }
  const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))

  const nodes: Array<GraphNodeDatum> = input.nodes.map((node) => ({
    id: node.id,
    label: shortLabel(node.label),
    url: node.url,
    isCurrent: node.id === input.currentNodeId
  }))

  const nodeById = new Map(nodes.map((node) => [node.id, node]))
  const links: Array<GraphLinkDatum> = input.edges
    .filter((edge) => nodeById.has(edge.source) && nodeById.has(edge.target))
    .map((edge) => ({
      source: edge.source,
      target: edge.target,
      direction: edge.direction,
      key: `${edge.source}|${edge.target}`,
      hasReciprocal: false
    }))

  const linkKeys = new Set(links.map((link) => link.key))
  links.forEach((link, index) => {
    const source = typeof link.source === "string" ? link.source : link.source.id
    const target = typeof link.target === "string" ? link.target : link.target.id
    const reciprocal = `${target}|${source}`
    if (linkKeys.has(reciprocal)) {
      links[index] = { ...link, hasReciprocal: true }
    }
  })

  const inboundNodeIds = new Set<string>()
  const outboundNodeIds = new Set<string>()
  links.forEach((link) => {
    const source = typeof link.source === "string" ? link.source : link.source.id
    const target = typeof link.target === "string" ? link.target : link.target.id
    if (source === input.currentNodeId && target !== input.currentNodeId) {
      outboundNodeIds.add(target)
    }
    if (target === input.currentNodeId && source !== input.currentNodeId) {
      inboundNodeIds.add(source)
    }
  })

  const svg = document.createElementNS(svgNamespace, "svg")
  svg.classList.add("source-graph__svg")
  svg.setAttribute("viewBox", `0 0 ${width()} ${height()}`)
  container.append(svg)

  const defs = document.createElementNS(svgNamespace, "defs")
  svg.append(defs)
  const markerSalt = `${Math.random().toString(36).slice(2, 10)}`
  const outboundMarkerId = `source-graph-arrow-out-${markerSalt}`
  const inboundMarkerId = `source-graph-arrow-in-${markerSalt}`

  const createArrowMarker = (id: string, variantClass: string) => {
    const marker = document.createElementNS(svgNamespace, "marker")
    marker.setAttribute("id", id)
    marker.setAttribute("markerWidth", "12")
    marker.setAttribute("markerHeight", "12")
    marker.setAttribute("refX", "10")
    marker.setAttribute("refY", "6")
    marker.setAttribute("orient", "auto")
    marker.setAttribute("markerUnits", "strokeWidth")

    const arrow = document.createElementNS(svgNamespace, "path")
    arrow.setAttribute("d", "M0,0 L12,6 L0,12 z")
    arrow.classList.add("source-graph__arrow", variantClass)
    marker.append(arrow)
    defs.append(marker)
  }

  createArrowMarker(outboundMarkerId, "source-graph__arrow--outbound")
  createArrowMarker(inboundMarkerId, "source-graph__arrow--inbound")

  const linksGroup = document.createElementNS(svgNamespace, "g")
  linksGroup.classList.add("source-graph__edges")
  svg.append(linksGroup)

  const nodesGroup = document.createElementNS(svgNamespace, "g")
  nodesGroup.classList.add("source-graph__nodes")
  svg.append(nodesGroup)

  const edgeElements = new Map<GraphLinkDatum, SVGPathElement>()
  links.forEach((link) => {
    const path = document.createElementNS(svgNamespace, "path")
    path.classList.add("source-graph__edge")
    path.classList.add(link.direction === "inbound" ? "source-graph__edge--inbound" : "source-graph__edge--outbound")
    path.setAttribute("fill", "none")
    path.setAttribute("marker-end", `url(#${link.direction === "inbound" ? inboundMarkerId : outboundMarkerId})`)
    linksGroup.append(path)
    edgeElements.set(link, path)
  })

  const nodeElements = new Map<string, SVGGElement>()
  nodes.forEach((node) => {
    const group = document.createElementNS(svgNamespace, "g")
    group.classList.add("source-graph__node")
    if (node.isCurrent) {
      group.classList.add("is-current")
    } else {
      if (inboundNodeIds.has(node.id)) {
        group.classList.add("is-inbound")
      }
      if (outboundNodeIds.has(node.id)) {
        group.classList.add("is-outbound")
      }
      if (inboundNodeIds.has(node.id) && outboundNodeIds.has(node.id)) {
        group.classList.add("is-bidirectional")
      }
    }

    const hit = document.createElementNS(svgNamespace, "circle")
    hit.classList.add("source-graph__node-hit")
    group.append(hit)

    const circle = document.createElementNS(svgNamespace, "circle")
    circle.classList.add("source-graph__node-dot")
    group.append(circle)

    const label = document.createElementNS(svgNamespace, "text")
    label.classList.add("source-graph__node-label")
    label.textContent = node.label
    label.setAttribute("text-anchor", "middle")
    group.append(label)

    nodesGroup.append(group)
    nodeElements.set(node.id, group)
  })

  const currentNode = nodes.find((node) => node.isCurrent)
  const repositionCurrentNode = () => {
    if (!currentNode) {
      return
    }
    const bounds = zone()
    const labelHalfWidth = Math.max(currentNodeRadius, Math.min(112, Math.round(currentNode.label.length * 4.2 + 14)))
    const minX = bounds.left + labelHalfWidth + boundaryInset
    const maxX = bounds.right - labelHalfWidth - boundaryInset
    const minY = bounds.top + currentNodeRadius + boundaryInset
    const maxY = bounds.bottom - (currentNodeRadius + labelOffsetY + labelHeight + boundaryInset)

    currentNode.fx = clamp(bounds.left + bounds.width * 0.43, minX, maxX)
    currentNode.fy = clamp(bounds.top + bounds.height * 0.5, minY, maxY)
    currentNode.x = currentNode.fx
    currentNode.y = currentNode.fy
  }
  repositionCurrentNode()

  nodes.forEach((node) => {
    if (node.isCurrent) {
      return
    }
    const bounds = zone()
    node.x = bounds.left + bounds.width * (0.1 + Math.random() * 0.85)
    node.y = bounds.top + bounds.height * (0.08 + Math.random() * 0.84)
  })

  const initialZone = zone()
  const simulation = forceSimulation(nodes)
    .force("charge", forceManyBody().strength(-740))
    .force("center", forceCenter(initialZone.left + initialZone.width * 0.56, initialZone.top + initialZone.height * 0.5))
    .force("link", forceLink<GraphNodeDatum, GraphLinkDatum>(links).id((node: GraphNodeDatum) => node.id).distance(188).strength(0.54))
    .force(
      "collision",
      forceCollide<GraphNodeDatum>().radius((node: GraphNodeDatum) =>
        (node.isCurrent ? currentNodeRadius : nodeRadius) + 30
      ).iterations(3)
    )
    .alphaDecay(0.06)
    .velocityDecay(0.36)

  const neighbors = new Map<string, Set<string>>()
  nodes.forEach((node) => neighbors.set(node.id, new Set<string>([node.id])))
  links.forEach((link) => {
    const source = typeof link.source === "string" ? link.source : link.source.id
    const target = typeof link.target === "string" ? link.target : link.target.id
    neighbors.get(source)?.add(target)
    neighbors.get(target)?.add(source)
  })

  const axisBounds = (min: number, max: number) => {
    if (max >= min) {
      return { min, max }
    }
    const center = (min + max) / 2
    return { min: center, max: center }
  }

  const nodePositionBounds = (node: GraphNodeDatum, bounds: GraphZone) => {
    const radius = node.isCurrent ? currentNodeRadius : nodeRadius
    const labelHalfWidth = Math.max(radius, Math.min(112, Math.round(node.label.length * 4.2 + 14)))

    const xBounds = axisBounds(
      bounds.left + labelHalfWidth + boundaryInset,
      bounds.right - labelHalfWidth - boundaryInset
    )
    const yBounds = axisBounds(
      bounds.top + radius + boundaryInset,
      bounds.bottom - (radius + labelOffsetY + labelHeight + boundaryInset)
    )

    return {
      minX: xBounds.min,
      maxX: xBounds.max,
      minY: yBounds.min,
      maxY: yBounds.max
    }
  }

  const constrainNodeToBounds = (node: GraphNodeDatum, bounds: GraphZone) => {
    const nodeBounds = nodePositionBounds(node, bounds)
    const x = node.x ?? nodeBounds.minX
    const y = node.y ?? nodeBounds.minY

    if (x < nodeBounds.minX) {
      node.x = nodeBounds.minX
      node.vx = Math.abs(node.vx ?? 0) * 0.7
    } else if (x > nodeBounds.maxX) {
      node.x = nodeBounds.maxX
      node.vx = -Math.abs(node.vx ?? 0) * 0.7
    }

    if (y < nodeBounds.minY) {
      node.y = nodeBounds.minY
      node.vy = Math.abs(node.vy ?? 0) * 0.7
    } else if (y > nodeBounds.maxY) {
      node.y = nodeBounds.maxY
      node.vy = -Math.abs(node.vy ?? 0) * 0.7
    }
  }

  const render = () => {
    const bounds = zone()
    nodes.forEach((node) => constrainNodeToBounds(node, bounds))

    links.forEach((link) => {
      const source = typeof link.source === "string" ? nodeById.get(link.source)! : link.source
      const target = typeof link.target === "string" ? nodeById.get(link.target)! : link.target
      const element = edgeElements.get(link)
      if (!element || !source || !target) {
        return
      }
      const sourceBounds = nodePositionBounds(source, bounds)
      const targetBounds = nodePositionBounds(target, bounds)
      const sx = clamp(source.x ?? 0, sourceBounds.minX, sourceBounds.maxX)
      const sy = clamp(source.y ?? 0, sourceBounds.minY, sourceBounds.maxY)
      const tx = clamp(target.x ?? 0, targetBounds.minX, targetBounds.maxX)
      const ty = clamp(target.y ?? 0, targetBounds.minY, targetBounds.maxY)

      const dx = tx - sx
      const dy = ty - sy
      const distance = Math.hypot(dx, dy)
      if (distance < 1e-3) {
        element.setAttribute("d", `M ${sx} ${sy} L ${tx} ${ty}`)
        return
      }

      const ux = dx / distance
      const uy = dy / distance
      const sourceRadius = source.isCurrent ? currentNodeRadius : nodeRadius
      const targetRadius = target.isCurrent ? currentNodeRadius : nodeRadius
      const trim = 6
      const markerTrim = 9
      const startX = sx + ux * (sourceRadius + trim)
      const startY = sy + uy * (sourceRadius + trim)
      const endX = tx - ux * (targetRadius + trim + markerTrim)
      const endY = ty - uy * (targetRadius + trim + markerTrim)

      if (link.hasReciprocal) {
        const mx = (startX + endX) / 2
        const my = (startY + endY) / 2
        const px = -uy
        const py = ux
        const curvature = link.direction === "outbound" ? 18 : -18
        element.setAttribute("d", `M ${startX} ${startY} Q ${mx + px * curvature} ${my + py * curvature} ${endX} ${endY}`)
      } else {
        element.setAttribute("d", `M ${startX} ${startY} L ${endX} ${endY}`)
      }
    })

    nodes.forEach((node) => {
      const element = nodeElements.get(node.id)
      if (!element) {
        return
      }

      const nodeBounds = nodePositionBounds(node, bounds)
      const x = clamp(node.x ?? 0, nodeBounds.minX, nodeBounds.maxX)
      const y = clamp(node.y ?? 0, nodeBounds.minY, nodeBounds.maxY)
      element.setAttribute("transform", `translate(${x}, ${y})`)
    })
  }

  simulation.on("tick", render)
  render()

  const applyFocus = (nodeId: string) => {
    const neighborhood = neighbors.get(nodeId) ?? new Set<string>([nodeId])

    nodeElements.forEach((element, id) => {
      element.classList.toggle("is-dim", !neighborhood.has(id))
      element.classList.toggle("is-focused", neighborhood.has(id))
    })

    links.forEach((link) => {
      const source = typeof link.source === "string" ? link.source : link.source.id
      const target = typeof link.target === "string" ? link.target : link.target.id
      const element = edgeElements.get(link)
      if (!element) {
        return
      }
      const visible = neighborhood.has(source) && neighborhood.has(target)
      element.classList.toggle("is-dim", !visible)
      element.classList.toggle("is-focused", visible)
    })
  }

  applyFocus(input.currentNodeId)

  const cleanupHandlers: Array<() => void> = []

  links.forEach((link) => {
    const element = edgeElements.get(link)
    if (!element) {
      return
    }
    const onEnter = () => element.classList.add("is-hover")
    const onLeave = () => element.classList.remove("is-hover")
    element.addEventListener("mouseenter", onEnter)
    element.addEventListener("mouseleave", onLeave)
    cleanupHandlers.push(() => {
      element.removeEventListener("mouseenter", onEnter)
      element.removeEventListener("mouseleave", onLeave)
    })
  })

  nodeElements.forEach((element, id) => {
    const node = nodeById.get(id)
    if (!node) {
      return
    }

    const onEnter = () => applyFocus(id)
    const onLeave = () => applyFocus(input.currentNodeId)
    const onClick = () => {
      if (node.url) {
        window.location.assign(node.url)
      }
    }

    element.addEventListener("mouseenter", onEnter)
    element.addEventListener("mouseleave", onLeave)
    element.addEventListener("click", onClick)
    cleanupHandlers.push(() => {
      element.removeEventListener("mouseenter", onEnter)
      element.removeEventListener("mouseleave", onLeave)
      element.removeEventListener("click", onClick)
    })
  })

  const resizeObserver = new ResizeObserver(() => {
    const w = width()
    const h = height()
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`)
    repositionCurrentNode()
    const bounds = zone()
    simulation.force("center", forceCenter(bounds.left + bounds.width * 0.58, bounds.top + bounds.height * 0.5))
    simulation.alpha(0.22).restart()
  })
  resizeObserver.observe(container)

  return () => {
    cleanupHandlers.forEach((cleanup) => cleanup())
    resizeObserver.disconnect()
    simulation.stop()
    svg.remove()
  }
}
