const onReady = (callback) => {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback, { once: true })
    return
  }

  callback()
}

const getHashTemplateId = () => window.location.hash.replace(/^#/, "")

const setHashTemplateId = (templateId) => {
  const nextUrl = new URL(window.location.href)
  nextUrl.hash = templateId
  window.history.replaceState({}, "", nextUrl)
}

const initializeTemplateLibrary = (root) => {
  const panels = Array.from(root.querySelectorAll("[data-template-panel]"))
  const groupControls = Array.from(root.querySelectorAll("[data-template-group-control]"))
  const groupTabs = Array.from(root.querySelectorAll("[data-template-group-tabs]"))
  const navLinks = Array.from(root.querySelectorAll("[data-template-nav]"))
  const panelMap = new Map(panels.map((panel) => [panel.dataset.templateId || "", panel]))
  const lastTemplateByGroup = new Map()

  if (panels.length === 0) {
    return
  }

  let activeLanguage = root.dataset.templateDefaultLanguage || "java"
  const defaultTemplateId = root.dataset.templateDefault || panels[0].dataset.templateId || ""

  const renderLanguage = (panel, nextLanguage) => {
    const controls = Array.from(panel.querySelectorAll("[data-code-collection-language-control]"))
    const selectedControl = controls.find((control) => control.dataset.codeCollectionLanguage === nextLanguage) || controls[0]
    const selectedLanguage = selectedControl?.dataset.codeCollectionLanguage || nextLanguage

    activeLanguage = selectedLanguage

    if (selectedControl && selectedControl.getAttribute("aria-pressed") !== "true") {
      selectedControl.click()
    }
  }

  const renderTemplate = (templateId, { updateHash = true } = {}) => {
    const nextPanel = panelMap.get(templateId) || panelMap.get(defaultTemplateId) || panels[0]
    const nextTemplateId = nextPanel.dataset.templateId || defaultTemplateId
    const nextGroupId = nextPanel.dataset.templateGroup || ""

    panels.forEach((panel) => {
      const isActive = panel === nextPanel
      panel.hidden = !isActive
      panel.classList.toggle("is-active", isActive)
    })

    root.dataset.templateActive = nextTemplateId
    root.dataset.templateGroup = nextGroupId
    lastTemplateByGroup.set(nextGroupId, nextTemplateId)

    groupControls.forEach((control) => {
      const isActive = control.dataset.templateGroup === nextGroupId
      control.classList.toggle("template-library__group--active", isActive)
      control.setAttribute("aria-pressed", isActive ? "true" : "false")
    })

    groupTabs.forEach((groupTab) => {
      groupTab.hidden = groupTab.dataset.templateGroupTabs !== nextGroupId
    })

    navLinks.forEach((link) => {
      const isActive = link.dataset.templateTarget === nextTemplateId
      link.classList.toggle("template-library__tab--active", isActive && link.classList.contains("template-library__tab"))
      link.setAttribute("aria-pressed", isActive ? "true" : "false")
    })

    renderLanguage(nextPanel, activeLanguage)

    if (updateHash) {
      setHashTemplateId(nextTemplateId)
    }
  }

  const attachTemplateLink = (link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault()
      renderTemplate(link.dataset.templateTarget || "")
    })
  }

  navLinks.forEach(attachTemplateLink)
  groupControls.forEach((control) => {
    control.addEventListener("click", () => {
      const groupId = control.dataset.templateGroup || ""
      const target = lastTemplateByGroup.get(groupId) || control.dataset.templateTarget || defaultTemplateId
      renderTemplate(target)
    })
  })

  root.addEventListener("click", (event) => {
    const control = event.target.closest("[data-code-collection-language-control]")
    if (!control) {
      return
    }

    activeLanguage = control.dataset.codeCollectionLanguage || activeLanguage
  })

  window.addEventListener("hashchange", () => {
    const nextTemplateId = decodeURIComponent(getHashTemplateId())
    if (nextTemplateId) {
      renderTemplate(nextTemplateId, { updateHash: false })
    }
  })

  const initialTemplateId = decodeURIComponent(getHashTemplateId()) || defaultTemplateId
  renderTemplate(initialTemplateId, { updateHash: !getHashTemplateId() })
}

onReady(() => {
  document.querySelectorAll("[data-template-library]").forEach(initializeTemplateLibrary)
})
