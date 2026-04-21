const onReady = (callback) => {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback, { once: true })
    return
  }

  callback()
}

const parseNumber = (value, fallback = 0) => {
  const parsed = Number.parseFloat(value || "")
  return Number.isFinite(parsed) ? parsed : fallback
}

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

const queryTemplate = (root, nodeId) =>
  root.querySelector(`template[data-flowchart-template="${CSS.escape(nodeId)}"]`)

const queryNodeButton = (root, nodeId) =>
  root.querySelector(`[data-flowchart-node-id="${CSS.escape(nodeId)}"]`)

const getHashNodeId = () => {
  const hash = window.location.hash.replace(/^#/, "")
  return hash ? decodeURIComponent(hash) : ""
}

const replaceHash = (nodeId) => {
  const nextUrl = new URL(window.location.href)
  nextUrl.hash = nodeId ? encodeURIComponent(nodeId) : ""
  window.history.replaceState({}, "", nextUrl)
}

const renderMathIn = (element) => {
  if (!(element instanceof Element) || typeof window.renderMathInElement !== "function") {
    return
  }

  window.renderMathInElement(element, {
    delimiters: [
      { left: "$$", right: "$$", display: true },
      { left: "\\[", right: "\\]", display: true },
      { left: "$", right: "$", display: false },
      { left: "\\(", right: "\\)", display: false }
    ],
    throwOnError: false,
    ignoredTags: ["script", "noscript", "style", "textarea", "pre", "code"]
  })
}

const MAX_SUMMARY_BLOCKS = 3
const MAX_SUMMARY_PARAGRAPHS = 2
const MAX_SUMMARY_LIST_ITEMS = 2
const MAX_SUMMARY_NESTED_ITEMS = 2

const trimListClone = (list, maxItems = MAX_SUMMARY_LIST_ITEMS) => {
  Array.from(list.children).slice(maxItems).forEach((item) => item.remove())

  list.querySelectorAll("ul, ol").forEach((nestedList) => {
    Array.from(nestedList.children).slice(MAX_SUMMARY_NESTED_ITEMS).forEach((item) => item.remove())
  })

  return list
}

const createSummaryLabel = (text) => {
  const label = document.createElement("p")
  label.className = "flowchart-summary__label"
  label.textContent = text
  return label
}

const buildNoteSummary = (prose) => {
  if (!(prose instanceof Element)) {
    return null
  }

  const summary = document.createElement("div")
  const children = Array.from(prose.children)
  let summaryBlocks = 0
  let paragraphCount = 0
  let listCount = 0

  for (let index = 0; index < children.length; index += 1) {
    if (summaryBlocks >= MAX_SUMMARY_BLOCKS) {
      break
    }

    const child = children[index]
    const tagName = child.tagName.toLowerCase()

    if ((tagName === "h2" || tagName === "h3" || tagName === "h4") && summaryBlocks > 0) {
      break
    }

    if (tagName === "p") {
      if (paragraphCount >= MAX_SUMMARY_PARAGRAPHS) {
        continue
      }

      const nextStructuralChild = children.slice(index + 1).find((nextChild) => {
        const nextTagName = nextChild.tagName.toLowerCase()
        return nextTagName === "p" || nextTagName === "ul" || nextTagName === "ol" || nextTagName === "h2" || nextTagName === "h3" || nextTagName === "h4"
      })

      if (paragraphCount > 0 && nextStructuralChild) {
        const nextTagName = nextStructuralChild.tagName.toLowerCase()
        if (nextTagName === "ul" || nextTagName === "ol") {
          continue
        }
      }

      summary.append(child.cloneNode(true))
      paragraphCount += 1
      summaryBlocks += 1
      continue
    }

    if (tagName === "ul" || tagName === "ol") {
      if (listCount >= 2) {
        continue
      }

      const listClone = trimListClone(child.cloneNode(true))
      if (listClone.children.length > 0) {
        if (listCount === 0) {
          summary.append(createSummaryLabel("Key Signals"))
        }
        summary.append(listClone)
        listCount += 1
        summaryBlocks += 1
      }
    }
  }

  if (summary.children.length === 0 && prose.firstElementChild) {
    summary.append(prose.firstElementChild.cloneNode(true))
  }

  return summary.children.length > 0 ? summary : null
}

const createInspectorTab = (label, panelName) => {
  const button = document.createElement("button")
  button.type = "button"
  button.className = "flowchart-inspector__tab"
  button.dataset.flowchartTab = panelName
  button.textContent = label
  return button
}

const toSentenceCase = (value) => {
  if (!value) {
    return ""
  }

  return value.charAt(0).toUpperCase() + value.slice(1)
}

const createRouteAnswer = (answerText) => {
  if (!answerText) {
    return null
  }

  const answer = document.createElement("span")
  const answerSlug = answerText.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-")
  answer.className = "flowchart-path__answer"
  if (answerSlug) {
    answer.classList.add(`flowchart-path__answer--${answerSlug}`)
  }
  answer.textContent = toSentenceCase(answerText)

  return answer
}

const createRouteButton = (step, onSelectRouteNode) => {
  const button = document.createElement("button")
  button.type = "button"
  button.className = "flowchart-path__button"
  button.textContent = step.question || step.label || step.title
  button.addEventListener("click", () => {
    onSelectRouteNode?.(step.id)
  })
  return button
}

const createRouteStep = ({ step, answer, current = false, onSelectRouteNode }) => {
  const block = document.createElement("li")
  block.className = "flowchart-path__step"

  if (current) {
    block.classList.add("is-current")
  }
  if (!answer) {
    block.classList.add("flowchart-path__step--pending")
  }

  const main = document.createElement("div")
  main.className = "flowchart-path__main"
  main.append(createRouteButton(step, onSelectRouteNode))

  const answerElement = createRouteAnswer(answer)
  if (answerElement) {
    main.append(answerElement)
  }

  block.append(main)
  return block
}

const createRoutePanel = (route, onSelectRouteNode) => {
  if (!Array.isArray(route) || route.length === 0) {
    return null
  }

  const panel = document.createElement("section")
  panel.className = "flowchart-inspector__panel flowchart-path"

  const finalStep = route[route.length - 1]
  const traversedQuestions = route.slice(0, -1).map((step, index) => ({
    step,
    answer: route[index + 1]?.answer || ""
  })).filter(({ step }) => step.kind === "decision")

  const list = document.createElement("ol")
  list.className = "flowchart-path__sequence"

  traversedQuestions.forEach(({ step, answer }) => {
    list.append(createRouteStep({
      step,
      answer,
      onSelectRouteNode
    }))
  })

  if (finalStep.kind === "decision") {
    list.append(createRouteStep({
      step: finalStep,
      current: true,
      onSelectRouteNode
    }))
  }

  if (list.children.length === 0) {
    return null
  }

  panel.append(list)

  return panel
}

const decorateInspector = (content, {
  route,
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
  const routePanel = createRoutePanel(route, onSelectRouteNode)

  if (notePanel) {
    const prose = notePanel.querySelector(".flowchart-prose")
    if (notePanel.hasAttribute("data-flowchart-structured-summary")) {
      prose?.classList.add("flowchart-prose--summary")
    } else {
      const summary = buildNoteSummary(prose)
      if (prose && summary) {
        prose.replaceChildren(...Array.from(summary.children))
        prose.classList.add("flowchart-prose--summary")
      }
    }
  }

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
    templatesPanel ? { label: "Related Templates", name: "templates", element: templatesPanel } : null,
    referencesPanel ? { label: "Related Problems", name: "problems", element: referencesPanel } : null
  ].filter(Boolean)

  if (panels.length < 2) {
    return
  }

  const tabs = document.createElement("div")
  tabs.className = "flowchart-inspector__tabs"

  const setActivePanel = (panelName) => {
    panels.forEach((panel) => {
      const isActive = panel.name === panelName
      panel.element.hidden = !isActive
      panel.element.classList.toggle("is-active", isActive)
      tabs.querySelector(`[data-flowchart-tab="${panel.name}"]`)?.classList.toggle("is-active", isActive)
    })
    onActivePanelChange?.(panelName)
  }

  panels.forEach((panel) => {
    panel.element.dataset.flowchartPanel = panel.name
    const tab = createInspectorTab(panel.label, panel.name)
    tab.addEventListener("click", () => {
      setActivePanel(panel.name)
    })
    tabs.append(tab)
  })

  templateRoot.insertBefore(tabs, panels[0].element)
  const nextPanelName = panels.some((panel) => panel.name === activePanelName) ? activePanelName : panels[0].name
  setActivePanel(nextPanelName)
}

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
  const nodeMeta = new Map(nodeButtons.map((button) => {
    const nodeId = button.dataset.flowchartNodeId || ""
    return [nodeId, {
      id: nodeId,
      kind: button.dataset.flowchartNodeKind || "",
      title: button.dataset.flowchartNodeTitle || button.dataset.flowchartNodeLabel || "",
      label: button.dataset.flowchartNodeLabel || button.dataset.flowchartNodeTitle || "",
      question: button.dataset.flowchartNodeKind === "decision"
        ? (button.dataset.flowchartNodeLabel || button.dataset.flowchartNodeTitle || "")
        : (button.dataset.flowchartNodeTitle || button.dataset.flowchartNodeLabel || ""),
      parentId: button.dataset.flowchartParentId || "",
      answer: button.dataset.flowchartParentAnswer || ""
    }]
  }))

  const state = {
    scale: desktopScale,
    selectedId: "",
    previewId: null,
    activePanel: "summary",
    dragStartX: 0,
    dragStartY: 0,
    dragStartLeft: 0,
    dragStartTop: 0,
    pointerId: null,
    pointerDown: false,
    isDragging: false,
    suppressClick: false
  }

  const getPreferredScale = () => (window.matchMedia("(max-width: 820px)").matches ? mobileScale : desktopScale)

  const getViewportMaxScrollLeft = () => Math.max(0, scaled.offsetWidth - viewport.clientWidth)
  const getViewportMaxScrollTop = () => Math.max(0, scaled.offsetHeight - viewport.clientHeight)
  const canPanViewport = () => getViewportMaxScrollLeft() > 1 || getViewportMaxScrollTop() > 1

  const syncScale = () => {
    const preferredScale = getPreferredScale()
    const fitScale = viewport.clientWidth > 0 ? viewport.clientWidth / chartWidth : preferredScale

    state.scale = Math.min(preferredScale, fitScale)
    root.style.setProperty("--flowchart-scale", String(state.scale))
    scaled.style.width = `${chartWidth * state.scale}px`
    scaled.style.height = `${chartHeight * state.scale}px`
    root.classList.toggle("is-pannable", canPanViewport())
  }

  const hideInspector = () => {
    inspector.hidden = true
    root.classList.add("flowchart-workspace--empty")
  }

  const buildRoute = (nodeId) => {
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

  const getActiveRouteId = () => state.previewId || state.selectedId

  const renderInspector = (nodeId) => {
    const template = queryTemplate(root, nodeId)
    if (!template) {
      return
    }

    const route = buildRoute(nodeId)
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
    const activeRouteId = getActiveRouteId()
    const route = buildRoute(activeRouteId)
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

  const scrollViewportToChartPoint = (chartX, chartY, behavior = "smooth") => {
    if (!canPanViewport()) {
      return
    }

    const left = clamp((chartX * state.scale) - (viewport.clientWidth / 2), 0, getViewportMaxScrollLeft())
    const top = clamp((chartY * state.scale) - (viewport.clientHeight / 2), 0, getViewportMaxScrollTop())
    viewport.scrollTo({
      left,
      top,
      behavior
    })
  }

  const scrollPageToElement = (element, behavior = "smooth") => {
    if (!(element instanceof Element)) {
      return
    }

    const rect = element.getBoundingClientRect()
    const maxScrollTop = Math.max(0, document.documentElement.scrollHeight - window.innerHeight)
    const targetTop = clamp(
      window.scrollY + rect.top - ((window.innerHeight - rect.height) / 2),
      0,
      maxScrollTop
    )

    window.scrollTo({
      top: targetTop,
      behavior
    })
  }

  const centerNode = (nodeId, behavior = "smooth") => {
    const button = queryNodeButton(root, nodeId)
    if (!button) {
      return
    }

    if (!canPanViewport()) {
      scrollPageToElement(button, behavior)
      return
    }

    scrollViewportToChartPoint(
      button.offsetLeft + (button.offsetWidth / 2),
      button.offsetTop + (button.offsetHeight / 2),
      behavior
    )
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

  const endDrag = () => {
    root.classList.remove("is-dragging")
    if (state.isDragging) {
      state.suppressClick = true
      window.setTimeout(() => {
        state.suppressClick = false
      }, 0)
    }

    if (state.pointerId !== null && viewport.hasPointerCapture?.(state.pointerId)) {
      viewport.releasePointerCapture(state.pointerId)
    }

    state.pointerDown = false
    state.pointerId = null
    state.isDragging = false
  }

  viewport.addEventListener("pointerdown", (event) => {
    if (!canPanViewport()) {
      return
    }

    if (event.button !== 0) {
      return
    }

    if (event.target instanceof Element && event.target.closest("[data-flowchart-node]")) {
      return
    }

    state.pointerDown = true
    state.pointerId = event.pointerId
    state.dragStartX = event.clientX
    state.dragStartY = event.clientY
    state.dragStartLeft = viewport.scrollLeft
    state.dragStartTop = viewport.scrollTop
    state.isDragging = false
    viewport.setPointerCapture?.(event.pointerId)
  })

  viewport.addEventListener("pointermove", (event) => {
    if (!state.pointerDown || event.pointerId !== state.pointerId) {
      return
    }

    const deltaX = event.clientX - state.dragStartX
    const deltaY = event.clientY - state.dragStartY

    if (!state.isDragging && (Math.abs(deltaX) > 6 || Math.abs(deltaY) > 6)) {
      state.isDragging = true
      root.classList.add("is-dragging")
      state.previewId = null
      if (state.selectedId) {
        renderInspector(state.selectedId)
      } else {
        hideInspector()
      }
      renderNodeState()
    }

    if (!state.isDragging) {
      return
    }

    viewport.scrollLeft = state.dragStartLeft - deltaX
    viewport.scrollTop = state.dragStartTop - deltaY
    event.preventDefault()
  })

  const handlePointerFinish = (event) => {
    if (!state.pointerDown || event.pointerId !== state.pointerId) {
      return
    }

    endDrag()
  }

  viewport.addEventListener("pointerup", handlePointerFinish)
  viewport.addEventListener("pointercancel", handlePointerFinish)
  viewport.addEventListener("lostpointercapture", () => {
    if (!state.pointerDown) {
      return
    }

    endDrag()
  })

  window.addEventListener("blur", () => {
    if (!state.pointerDown) {
      return
    }

    endDrag()
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

  nodeButtons.forEach((button) => {
    const nodeId = button.dataset.flowchartNodeId || ""

    button.addEventListener("click", () => {
      if (state.suppressClick) {
        return
      }

      commitSelection(nodeId)
    })

    button.addEventListener("focus", () => {
      previewNode(nodeId)
    })

    button.addEventListener("blur", () => {
      clearPreview()
    })

    button.addEventListener("pointerenter", () => {
      previewNode(nodeId)
    })

    button.addEventListener("pointerleave", () => {
      clearPreview()
    })
  })

  window.addEventListener("hashchange", () => {
    const hashNodeId = getHashNodeId()
    if (hashNodeId && queryNodeButton(root, hashNodeId)) {
      commitSelection(hashNodeId, { scroll: true, updateHash: false })
      return
    }

    clearSelection({ updateHash: false })
  })

  window.addEventListener("resize", () => {
    const previousScale = state.scale
    syncScale()
    if (previousScale !== state.scale && state.selectedId) {
      centerNode(state.selectedId, "auto")
    }
  })

  syncScale()

  const hashNodeId = getHashNodeId()
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
