import { createRoutePanel } from "./eureka-flowchart-route-panel.js"

export const renderMathIn = (element) => {
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

const createInspectorTab = (label, panelName, controlsId) => {
  const button = document.createElement("button")
  button.type = "button"
  button.className = "control-button flowchart-inspector__tab"
  button.id = `flowchart-tab-${panelName}`
  button.dataset.flowchartTab = panelName
  button.setAttribute("role", "tab")
  button.setAttribute("aria-controls", controlsId)
  button.setAttribute("aria-selected", "false")
  button.tabIndex = -1
  button.textContent = label
  return button
}

export const decorateInspector = (content, {
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
  const routePanel = createRoutePanel({ route, choices, onSelectRouteNode })

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
    const tab = createInspectorTab(panel.label, panel.name, panelId)
    tab.addEventListener("click", () => {
      setActivePanel(panel.name)
    })
    tabs.append(tab)
  })

  tabs.addEventListener("keydown", (event) => {
    const currentIndex = panels.findIndex((panel) =>
      panel.name === tabs.querySelector('[aria-selected="true"]')?.dataset.flowchartTab
    )
    if (currentIndex < 0) {
      return
    }

    const offsets = {
      ArrowRight: 1,
      ArrowDown: 1,
      ArrowLeft: -1,
      ArrowUp: -1
    }

    let nextIndex
    if (event.key in offsets) {
      nextIndex = (currentIndex + offsets[event.key] + panels.length) % panels.length
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
  const nextPanelName = panels.some((panel) => panel.name === activePanelName) ? activePanelName : panels[0].name
  setActivePanel(nextPanelName)
}
