import { getHashValue, onHashChange, onReady, replaceHashValue } from "./dom.js"
import { createGraph, loadX6, registerFlowchartNode } from "./flowchart-x6.js"
import { createViewportController } from "./flowchart-viewport.js"

const GRAPH_RENDER_FRAME_LIMIT = 12
const KATEX_OPTIONS = {
  delimiters: [
    { left: "$$", right: "$$", display: true },
    { left: "\\[", right: "\\]", display: true },
    { left: "$", right: "$", display: false },
    { left: "\\(", right: "\\)", display: false }
  ],
  throwOnError: false,
  ignoredTags: ["script", "noscript", "style", "textarea", "pre", "code"]
}

// --- metadata / route -------------------------------------------------------

const asMap = (record) => {
  if (!record || typeof record !== "object" || Array.isArray(record)) {
    return new Map()
  }
  return new Map(Object.entries(record))
}

const graphMetadata = (graphData = {}) => ({
  aliasMap: asMap(graphData.aliasMap),
  choicesBySource: asMap(graphData.choicesBySource),
  nodeMeta: asMap(graphData.nodeMeta),
  rootId: graphData.rootId || graphData.nodes?.[0]?.id || ""
})

const buildRoute = (nodeMeta, nodeId) => {
  const route = []
  const seen = new Set()
  let currentId = nodeId

  while (currentId && !seen.has(currentId)) {
    seen.add(currentId)
    const current = nodeMeta.get(currentId)
    if (!current) {
      break
    }
    route.unshift(current)
    currentId = current.parentId
  }

  return route
}

const activeRouteId = (state) => state.previewId || state.selectedId

// --- node highlight ---------------------------------------------------------

const nodeButton = (root, nodeId) =>
  root.querySelector(`[data-flowchart-node-id="${CSS.escape(nodeId)}"]`)

const paintNodeState = ({ root, graph, nodeMeta, state }) => {
  const route = buildRoute(nodeMeta, activeRouteId(state))
  const routeNodeIds = new Set(route.map((step) => step.id))
  const routeEdgeTargets = new Set(route.filter((step) => step.parentId).map((step) => step.id))
  const hasPath = routeNodeIds.size > 1

  root.classList.toggle("has-route", hasPath)

  graph.getNodes().forEach((node) => {
    const button = nodeButton(root, node.id)
    const selected = node.id === state.selectedId
    const previewed = node.id === state.previewId
    const onPath = routeNodeIds.has(node.id)
    const dimmed = hasPath && !onPath

    button?.classList.toggle("is-selected", selected)
    button?.classList.toggle("is-previewed", previewed)
    button?.classList.toggle("is-path", onPath)
    button?.classList.toggle("is-dimmed", dimmed)
    button?.setAttribute("aria-pressed", selected ? "true" : "false")
  })

  graph.getEdges().forEach((edge) => {
    const edgeData = edge.getData() || {}
    const onPath = routeEdgeTargets.has(edgeData.to)
    const dimmed = routeEdgeTargets.size > 0 && !onPath
    edge.attr("line/strokeWidth", onPath ? 5 : 3)
    edge.attr("line/opacity", dimmed ? 0.34 : 1)
  })
}

// --- zoom chrome ------------------------------------------------------------

const zoomPercent = (scale) => Math.round(scale * 100)

const bindZoomControls = (root, { onResetZoom, onSetZoom, onStepZoom }) => {
  const container = root.querySelector("[data-flowchart-zoom-controls]")
  const range = root.querySelector("[data-flowchart-zoom-range]")
  const stepButtons = [...root.querySelectorAll("[data-flowchart-zoom-step]")]
  const value = root.querySelector("[data-flowchart-zoom-value]")

  range?.addEventListener("input", (event) => {
    if (event.currentTarget instanceof HTMLInputElement) {
      onSetZoom?.(Number.parseInt(event.currentTarget.value, 10) / 100)
    }
  })

  container?.addEventListener("click", (event) => {
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
    contains: (target) => target instanceof Node && container?.contains(target) === true,
    setHidden: (hidden) => {
      if (container) {
        container.hidden = hidden
      }
    },
    sync: (viewportState) => {
      if (!container || !viewportState) {
        return
      }
      const percent = zoomPercent(viewportState.scale)
      const minPercent = zoomPercent(viewportState.minScale)
      const maxPercent = zoomPercent(viewportState.maxScale)
      container.dataset.flowchartZoomMode = viewportState.mode
      if (range) {
        range.min = String(minPercent)
        range.max = String(maxPercent)
        range.value = String(percent)
      }
      if (value) {
        value.textContent = `${percent}%`
        value.value = `${percent}%`
      }
      stepButtons.forEach((button) => {
        const direction = Number.parseInt(button.dataset.flowchartZoomStep || "0", 10)
        button.disabled =
          (direction < 0 && percent <= minPercent) || (direction > 0 && percent >= maxPercent)
      })
    }
  }
}

// --- inspector (path + tabs + math) -----------------------------------------

const sentenceCase = (value) =>
  value ? value.charAt(0).toUpperCase() + value.slice(1) : ""

const plainLabel = (value) => (value || "").replaceAll("$", "")

const pathAnswer = (answerText) => {
  if (!answerText) {
    return null
  }
  const answer = document.createElement("span")
  const slug = answerText.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-")
  answer.className = "flowchart-path__answer"
  if (slug) {
    answer.classList.add(`flowchart-path__answer--${slug}`)
  }
  answer.textContent = sentenceCase(answerText)
  return answer
}

const pathButton = (step, onSelect) => {
  const button = document.createElement("button")
  const question = document.createElement("span")
  const label = step.question || step.label || step.title
  button.type = "button"
  button.className = "flowchart-path__button"
  button.setAttribute("aria-label", plainLabel(label))
  button.addEventListener("click", () => onSelect?.(step.id))
  question.className = "flowchart-path__question"
  question.textContent = label
  button.append(question)
  return button
}

const pathStep = ({ step, answer, current = false, onSelect }) => {
  const item = document.createElement("li")
  item.className = "flowchart-path__step"
  if (current) {
    item.classList.add("is-current")
  }
  if (step.kind === "decision" && !answer) {
    item.classList.add("flowchart-path__step--pending")
  }
  const entry = pathButton(step, onSelect)
  const answerElement = pathAnswer(answer)
  if (answerElement) {
    answerElement.setAttribute("aria-hidden", "true")
    entry.append(answerElement)
  }
  item.append(entry)
  return item
}

const choiceList = (choices, onSelect) => {
  if (!Array.isArray(choices) || choices.length === 0) {
    return null
  }
  const group = document.createElement("div")
  const label = document.createElement("p")
  const list = document.createElement("ol")
  group.className = "flowchart-path__next"
  label.className = "flowchart-path__next-label"
  label.textContent = "Next"
  list.className = "flowchart-path__choices"
  list.setAttribute("aria-label", "Next decisions")
  choices.forEach((choice) => {
    const item = document.createElement("li")
    const button = document.createElement("button")
    const choiceLabel = choice.question || choice.label || choice.title
    button.type = "button"
    button.className = "flowchart-path__choice"
    button.setAttribute(
      "aria-label",
      `${sentenceCase(choice.answer)}: ${plainLabel(choiceLabel)}`
    )
    button.addEventListener("click", () => onSelect?.(choice.id))
    const answerElement = pathAnswer(choice.answer)
    if (answerElement) {
      answerElement.classList.add("flowchart-path__choice-answer")
      button.append(answerElement)
    }
    const text = document.createElement("span")
    text.className = "flowchart-path__choice-label"
    text.textContent = choiceLabel
    button.append(text)
    item.append(button)
    list.append(item)
  })
  group.append(label, list)
  return group
}

const buildRoutePanel = ({ route, choices = [], onSelect }) => {
  if (!Array.isArray(route) || route.length === 0) {
    return null
  }
  const panel = document.createElement("section")
  panel.className = "flowchart-inspector__panel flowchart-path"
  const finalStep = route[route.length - 1]
  const questions = route
    .slice(0, -1)
    .map((step, index) => ({ step, answer: route[index + 1]?.answer || "" }))
    .filter(({ step }) => step.kind === "decision")
  const list = document.createElement("ol")
  list.className = "flowchart-path__sequence"
  questions.forEach(({ step, answer }) => {
    list.append(pathStep({ step, answer, onSelect }))
  })
  list.append(pathStep({ step: finalStep, current: true, onSelect }))
  if (list.children.length === 0) {
    return null
  }
  panel.append(list)
  const next = choiceList(choices, onSelect)
  if (next) {
    panel.append(next)
  }
  return panel
}

const renderMathIn = (element) => {
  if (!(element instanceof Element) || typeof window.renderMathInElement !== "function") {
    return
  }
  window.renderMathInElement(element, KATEX_OPTIONS)
}

const decorateInspector = (content, {
  route,
  choices,
  activePanelName = "summary",
  onActivePanelChange,
  onSelectRouteNode
} = {}) => {
  if (!(content instanceof DocumentFragment || content instanceof Element)) {
    return
  }
  const templateRoot = content.querySelector(".flowchart-inspector__template")
  if (!templateRoot) {
    return
  }

  const notePanel = templateRoot.querySelector("[data-flowchart-note]")
  const templatesPanel = templateRoot.querySelector("[data-flowchart-templates]")
  const referencesPanel = templateRoot.querySelector("[data-flowchart-references]")
  const routePanel = buildRoutePanel({ route, choices, onSelect: onSelectRouteNode })

  if (routePanel) {
    if (referencesPanel) {
      templateRoot.insertBefore(routePanel, referencesPanel)
    } else {
      templateRoot.append(routePanel)
    }
  }

  const panels = [
    notePanel ? { label: "Summary", name: "summary", element: notePanel } : null,
    routePanel ? { label: "Decision Path", name: "path", element: routePanel } : null,
    templatesPanel ? { label: "Template Guide", name: "templates", element: templatesPanel } : null,
    referencesPanel ? { label: "Related Problems", name: "problems", element: referencesPanel } : null
  ].filter(Boolean)

  if (panels.length < 2) {
    return
  }

  const tabs = document.createElement("div")
  tabs.className = "flowchart-inspector__tabs"
  tabs.setAttribute("role", "tablist")
  tabs.setAttribute("aria-label", "Flowchart inspector")

  const setActivePanel = (panelName) => {
    panels.forEach((panel) => {
      const isActive = panel.name === panelName
      panel.element.hidden = !isActive
      panel.element.classList.toggle("is-active", isActive)
      panel.element.setAttribute("aria-hidden", isActive ? "false" : "true")
      const tab = tabs.querySelector(`[data-flowchart-tab="${panel.name}"]`)
      if (tab) {
        tab.classList.toggle("is-active", isActive)
        tab.setAttribute("aria-selected", isActive ? "true" : "false")
        tab.tabIndex = isActive ? 0 : -1
      }
    })
    onActivePanelChange?.(panelName)
  }

  panels.forEach((panel) => {
    const panelId = `flowchart-panel-${panel.name}`
    panel.element.id = panelId
    panel.element.dataset.flowchartPanel = panel.name
    panel.element.setAttribute("role", "tabpanel")
    panel.element.setAttribute("aria-labelledby", `flowchart-tab-${panel.name}`)

    const tab = document.createElement("button")
    tab.type = "button"
    tab.className = "control-button flowchart-inspector__tab"
    tab.id = `flowchart-tab-${panel.name}`
    tab.dataset.flowchartTab = panel.name
    tab.setAttribute("role", "tab")
    tab.setAttribute("aria-controls", panelId)
    tab.setAttribute("aria-selected", "false")
    tab.tabIndex = -1
    tab.textContent = panel.label
    tab.addEventListener("click", () => setActivePanel(panel.name))
    tabs.append(tab)
  })

  tabs.addEventListener("keydown", (event) => {
    const currentIndex = panels.findIndex(
      (panel) => panel.name === tabs.querySelector('[aria-selected="true"]')?.dataset.flowchartTab
    )
    if (currentIndex < 0) {
      return
    }
    const delta = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }
    let nextIndex
    if (event.key in delta) {
      nextIndex = (currentIndex + delta[event.key] + panels.length) % panels.length
    } else if (event.key === "Home") {
      nextIndex = 0
    } else if (event.key === "End") {
      nextIndex = panels.length - 1
    } else {
      return
    }
    event.preventDefault()
    setActivePanel(panels[nextIndex].name)
    tabs.querySelector(`[data-flowchart-tab="${panels[nextIndex].name}"]`)?.focus()
  })

  templateRoot.insertBefore(tabs, panels[0].element)
  const initial = panels.some((panel) => panel.name === activePanelName)
    ? activePanelName
    : panels[0].name
  setActivePanel(initial)
}

// --- boot -------------------------------------------------------------------

const frame = () => new Promise((resolve) => window.requestAnimationFrame(resolve))

const isMeasurable = (element) => {
  if (!element) {
    return false
  }
  const rect = element.getBoundingClientRect()
  return rect.width > 0 && rect.height > 0
}

const waitForVisibleNodes = async (root, rootId) => {
  for (let attempt = 0; attempt < GRAPH_RENDER_FRAME_LIMIT; attempt += 1) {
    await frame()
    const candidate = (rootId && nodeButton(root, rootId)) || root.querySelector("[data-flowchart-node]")
    if (isMeasurable(candidate)) {
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

const queryTemplate = (root, nodeId) =>
  root.querySelector(`template[data-flowchart-template="${CSS.escape(nodeId)}"]`)

const initializeFlowchart = async (root) => {
  const surface = root.querySelector("[data-flowchart-surface]")
  const viewportElement = root.querySelector("[data-flowchart-viewport]")
  const inspector = root.querySelector("[data-flowchart-inspector]")
  const inspectorContent = root.querySelector("[data-flowchart-inspector-content]")
  const graphData = readGraphData(root)

  if (!surface || !inspector || !inspectorContent || !graphData) {
    return
  }

  const { aliasMap, choicesBySource, nodeMeta, rootId } = graphMetadata(graphData)
  const resolveNodeId = (nodeId) =>
    nodeMeta.has(nodeId) ? nodeId : aliasMap.get(nodeId) || nodeId

  const state = {
    selectedId: "",
    previewId: null,
    activePanel: "summary"
  }

  const initialHashNodeId = resolveNodeId(getHashValue())
  if (initialHashNodeId && nodeMeta.has(initialHashNodeId)) {
    root.classList.remove("flowchart-workspace--empty")
  }

  const x6Url = root.dataset.flowchartX6Url || "/assets/vendor/x6/x6.min.js"
  const X6 = await loadX6(x6Url)
  registerFlowchartNode(X6)
  const graph = createGraph(X6, surface, graphData)

  let zoomControls = null
  let focusSequence = 0

  const paint = () => paintNodeState({ root, graph, nodeMeta, state })
  let paintFrame = 0
  const schedulePaint = () => {
    if (paintFrame) {
      return
    }
    paintFrame = window.requestAnimationFrame(() => {
      paintFrame = 0
      paint()
    })
  }

  // X6 injects HTML node views asynchronously; re-apply selection classes when they appear.
  const nodeObserver = new MutationObserver((mutations) => {
    const added = mutations.some((mutation) =>
      Array.from(mutation.addedNodes).some((node) => {
        if (!(node instanceof Element)) {
          return false
        }
        return node.matches("[data-flowchart-node]") || node.querySelector("[data-flowchart-node]")
      })
    )
    if (added) {
      schedulePaint()
    }
  })
  nodeObserver.observe(surface, { childList: true, subtree: true })

  const viewport = createViewportController(graph, surface, graphData, {
    onChange: (viewportState) => zoomControls?.sync(viewportState)
  })

  const graphReady = await waitForVisibleNodes(root, rootId)
  if (!graphReady) {
    nodeObserver.disconnect()
    console.error("Flowchart graph did not render visible nodes. Keeping the static fallback visible.")
    return
  }

  const supportsHover =
    typeof window.matchMedia === "function" && window.matchMedia("(hover: hover)").matches

  zoomControls = bindZoomControls(root, {
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

  const showEnhanced = () => {
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

  const scheduleFocus = (nodeId, options = {}) => {
    const sequence = ++focusSequence
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        if (sequence !== focusSequence || state.selectedId !== nodeId) {
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
    paint()
    if (focus) {
      scheduleFocus(nodeId, { immediate })
    }
    if (updateHash) {
      replaceHashValue(nodeId)
    }
  }

  const clearSelection = ({ updateHash = true } = {}) => {
    focusSequence += 1
    state.selectedId = ""
    state.previewId = null
    viewport.cancel()
    hideInspector()
    paint()
    if (updateHash) {
      replaceHashValue("")
    }
  }

  // Hover only highlights the graph — inspector updates on click/hash only.
  const previewNode = (nodeId) => {
    nodeId = resolveNodeId(nodeId)
    if (!supportsHover || nodeId === state.selectedId || !nodeMeta.has(nodeId)) {
      return
    }
    state.previewId = nodeId
    paint()
  }

  const clearPreview = () => {
    if (!supportsHover || !state.previewId) {
      return
    }
    state.previewId = null
    paint()
  }

  graph.on("node:click", ({ node }) => commitSelection(node.id))
  graph.on("blank:click", () => clearSelection())
  graph.on("node:mouseenter", ({ node }) => previewNode(node.id))
  graph.on("node:mouseleave", () => clearPreview())

  surface.addEventListener("click", (event) => {
    const button = event.target.closest?.("[data-flowchart-node]")
    if (button && event.detail === 0) {
      commitSelection(button.dataset.flowchartNodeId || "")
    }
  })

  surface.addEventListener("focusin", (event) => {
    const button = event.target.closest?.("[data-flowchart-node]")
    if (button) {
      previewNode(button.dataset.flowchartNodeId || "")
    }
  })

  surface.addEventListener("focusout", (event) => {
    const button = event.target.closest?.("[data-flowchart-node]")
    if (
      button
      && !(event.relatedTarget instanceof Node && button.contains(event.relatedTarget))
    ) {
      clearPreview()
    }
  })

  surface.addEventListener("wheel", (event) => {
    if (viewport.zoomFromWheel(event)) {
      focusSequence += 1
    }
  }, { passive: false })

  surface.addEventListener("pointerdown", (event) => {
    if (event.button === 0 && !event.target.closest?.("[data-flowchart-node]")) {
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

  onHashChange(() => {
    const hashNodeId = resolveNodeId(getHashValue())
    if (hashNodeId && nodeMeta.has(hashNodeId)) {
      if (hashNodeId !== state.selectedId) {
        commitSelection(hashNodeId, { updateHash: false })
      }
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
    paint()
    showEnhanced()
    return
  }

  hideInspector()
  paint()
  showEnhanced()
}

onReady(() => {
  document.querySelectorAll("[data-flowchart]").forEach((root) => {
    initializeFlowchart(root).catch((error) => {
      console.error(error)
    })
  })
})
