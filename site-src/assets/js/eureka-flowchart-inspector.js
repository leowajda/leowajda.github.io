import { createRoutePanel } from "./eureka-flowchart-route-panel.js"
import { buildNoteSummary } from "./eureka-flowchart-summary.js"

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

const createInspectorTab = (label, panelName) => {
  const button = document.createElement("button")
  button.type = "button"
  button.className = "control-button flowchart-inspector__tab"
  button.dataset.flowchartTab = panelName
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
  const routePanel = createRoutePanel(route, { choices, onSelectRouteNode })

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
    templatesPanel ? { label: "Template Guide", name: "templates", element: templatesPanel } : null,
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
