import { getHashValue, onHashChange, onReady, replaceHashValue } from "./dom.js"
import { createGraph, loadX6, registerFlowchartNode } from "./flowchart-x6.js"
import { createViewportController } from "./flowchart-viewport.js"

const paint = ({ root, graph, pathIds, selectedId }) => {
  const onPath = new Set(pathIds)
  const hasPath = onPath.size > 1
  root.classList.toggle("has-route", hasPath)

  graph.getNodes().forEach((node) => {
    const button = root.querySelector(`[data-flowchart-node-id="${CSS.escape(node.id)}"]`)
    const selected = node.id === selectedId
    const path = onPath.has(node.id)
    button?.classList.toggle("is-selected", selected)
    button?.classList.toggle("is-path", path)
    button?.classList.toggle("is-dimmed", hasPath && !path)
    button?.setAttribute("aria-pressed", selected ? "true" : "false")
  })

  graph.getEdges().forEach((edge) => {
    const to = edge.getData()?.to
    const path = onPath.has(to)
    edge.attr("line/strokeWidth", path ? 5 : 3)
    edge.attr("line/opacity", hasPath && !path ? 0.34 : 1)
  })
}

const bindZoom = (root, { onSetZoom, onStepZoom, onResetZoom }) => {
  const box = root.querySelector("[data-flowchart-zoom-controls]")
  const range = root.querySelector("[data-flowchart-zoom-range]")
  const value = root.querySelector("[data-flowchart-zoom-value]")

  const sync = (state) => {
    if (!box || !state) {
      return
    }
    const pct = Math.round(state.scale * 100)
    box.dataset.flowchartZoomMode = state.mode
    if (range) {
      range.min = String(Math.round(state.minScale * 100))
      range.max = String(Math.round(state.maxScale * 100))
      range.value = String(pct)
    }
    if (value) {
      value.textContent = `${pct}%`
      value.value = `${pct}%`
    }
  }

  range?.addEventListener("input", (event) => {
    if (event.currentTarget instanceof HTMLInputElement) {
      onSetZoom?.(Number.parseInt(event.currentTarget.value, 10) / 100)
    }
  })

  box?.addEventListener("click", (event) => {
    const step = event.target.closest?.("[data-flowchart-zoom-step]")
    if (step) {
      onStepZoom?.(Number.parseInt(step.dataset.flowchartZoomStep || "0", 10))
      return
    }
    if (event.target.closest?.("[data-flowchart-zoom-reset]")) {
      onResetZoom?.()
    }
  })

  return {
    contains: (target) => target instanceof Node && box?.contains(target) === true,
    setHidden: (hidden) => {
      if (box) {
        box.hidden = hidden
      }
    },
    sync
  }
}

const readGraph = (root) => {
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

const asMap = (value) =>
  value && typeof value === "object" && !Array.isArray(value)
    ? new Map(Object.entries(value))
    : new Map()

const initializeFlowchart = async (root) => {
  const surface = root.querySelector("[data-flowchart-surface]")
  const viewportEl = root.querySelector("[data-flowchart-viewport]")
  const inspector = root.querySelector("[data-flowchart-inspector]")
  const inspectorContent = root.querySelector("[data-flowchart-inspector-content]")
  const graphData = readGraph(root)
  if (!surface || !inspector || !inspectorContent || !graphData) {
    return
  }

  const aliasMap = asMap(graphData.aliasMap)
  const nodeMeta = asMap(graphData.nodeMeta)
  const resolve = (id) => (nodeMeta.has(id) ? id : aliasMap.get(id) || id)

  let selectedId = ""
  const pathIdsFor = (id) => {
    const template = root.querySelector(`template[data-flowchart-template="${CSS.escape(id)}"]`)
    const raw = template?.content?.querySelector("[data-flowchart-path-ids]")?.dataset.flowchartPathIds || id
    return raw.split(/\s+/).filter(Boolean)
  }

  const x6Url = root.dataset.flowchartX6Url || "/assets/vendor/x6/x6.min.js"
  const X6 = await loadX6(x6Url)
  registerFlowchartNode(X6)
  const graph = createGraph(X6, surface, graphData)

  let zoom = null
  const apply = () => {
    paint({ root, graph, pathIds: selectedId ? pathIdsFor(selectedId) : [], selectedId })
  }

  const viewport = createViewportController(graph, surface, graphData, {
    onChange: (state) => zoom?.sync(state)
  })

  // X6 injects HTML node views after fromJSON.
  const observer = new MutationObserver(() => {
    if (root.querySelector("[data-flowchart-node]")) {
      apply()
    }
  })
  observer.observe(surface, { childList: true, subtree: true })

  await new Promise((r) => window.requestAnimationFrame(() => window.requestAnimationFrame(r)))
  if (!root.querySelector("[data-flowchart-node]")) {
    observer.disconnect()
    console.error("Flowchart graph did not render visible nodes.")
    return
  }

  zoom = bindZoom(root, {
    onSetZoom: (scale) => viewport.setZoom(scale, { immediate: true }),
    onStepZoom: (direction) => viewport.stepZoom(direction, { immediate: true }),
    onResetZoom: () => {
      focusToken += 1
      viewport.resetAuto({ selectedNodeId: selectedId })
    }
  })

  const showInspector = (id) => {
    const template = root.querySelector(`template[data-flowchart-template="${CSS.escape(id)}"]`)
    if (!template) {
      return
    }
    inspectorContent.replaceChildren(template.content.cloneNode(true))
    if (typeof window.renderMathInElement === "function") {
      window.renderMathInElement(inspectorContent, {
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "\\[", right: "\\]", display: true },
          { left: "$", right: "$", display: false },
          { left: "\\(", right: "\\)", display: false }
        ],
        throwOnError: false
      })
    }
    inspector.hidden = false
    root.classList.remove("flowchart-workspace--empty")
  }

  let focusToken = 0
  const focusSelected = (id, options = {}) => {
    const token = ++focusToken
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        if (token !== focusToken || selectedId !== id) {
          return
        }
        viewport.focusNode(id, options)
      })
    })
  }

  const select = (id, { hash = true, focus = true, immediate = false } = {}) => {
    id = resolve(id)
    if (!nodeMeta.has(id)) {
      return
    }
    selectedId = id
    root.dataset.flowchartSelected = id
    showInspector(id)
    apply()
    if (focus) {
      viewport.cancel()
      if (immediate) {
        viewport.focusNode(id, { immediate: true })
      } else {
        // Keep current scale when user already zoomed manually.
        focusSelected(id, viewport.isManual() ? { scale: undefined } : {})
      }
    }
    if (hash) {
      replaceHashValue(id)
    }
  }

  const clear = ({ hash = true } = {}) => {
    selectedId = ""
    delete root.dataset.flowchartSelected
    inspector.hidden = true
    inspectorContent.replaceChildren()
    root.classList.add("flowchart-workspace--empty")
    apply()
    if (hash) {
      replaceHashValue("")
    }
  }

  graph.on("node:click", ({ node }) => select(node.id))
  graph.on("blank:click", () => clear())

  inspectorContent.addEventListener("click", (event) => {
    const link = event.target.closest?.("[data-flowchart-select]")
    if (!link) {
      return
    }
    event.preventDefault()
    select(link.dataset.flowchartSelect || "")
  })

  surface.addEventListener("wheel", (event) => {
    viewport.zoomFromWheel(event)
  }, { passive: false })

  viewportEl?.addEventListener("keydown", (event) => {
    if (zoom?.contains(event.target) || event.altKey || event.ctrlKey || event.metaKey) {
      return
    }
    if (event.key === "+" || event.key === "=") {
      event.preventDefault()
      viewport.stepZoom(1)
    } else if (event.key === "-") {
      event.preventDefault()
      viewport.stepZoom(-1)
    } else if (event.key === "0") {
      event.preventDefault()
      viewport.resetAuto({ selectedNodeId: selectedId })
    }
  })

  onHashChange(() => {
    const id = resolve(getHashValue())
    if (id && nodeMeta.has(id)) {
      if (id !== selectedId) {
        select(id, { hash: false })
      }
      return
    }
    clear({ hash: false })
  })

  window.addEventListener("resize", () => {
    if (selectedId) {
      viewport.refocusSelected(selectedId)
    } else {
      viewport.positionStart({ preserveScale: viewport.isManual() })
    }
  })

  viewport.positionStart()
  root.classList.add("flowchart-workspace--rendered")
  zoom.setHidden(false)
  zoom.sync(viewport.state())

  const initial = resolve(getHashValue())
  if (initial && nodeMeta.has(initial)) {
    select(initial, { hash: false, focus: true, immediate: true })
  } else {
    clear({ hash: false })
  }
  apply()
}

onReady(() => {
  document.querySelectorAll("[data-flowchart]").forEach((root) => {
    initializeFlowchart(root).catch((error) => console.error(error))
  })
})
