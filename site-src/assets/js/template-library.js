import { getHashValue, onReady, replaceHashValue } from "./dom.js"
import { loadPagefindRecords } from "./pagefind-client.js"
import { createSequenceGuard, meaningfulSearchQuery, normalizeSearchQuery } from "./search-query.js"

const collectRedirects = (root) =>
  new Map(
    Array.from(root.querySelectorAll("[data-template-redirect]"))
      .map((entry) => [entry.dataset.templateRedirectSource || "", entry.dataset.templateRedirectTarget || ""])
      .filter(([source, target]) => source && target)
  )

const initializeTemplateLibrary = (root) => {
  const branches = Array.from(root.querySelectorAll("[data-guide-branch]"))
  const patternControls = Array.from(root.querySelectorAll("[data-guide-pattern-control]"))
  const variantControls = Array.from(root.querySelectorAll("[data-guide-variant-control]"))
  const templatePanels = Array.from(root.querySelectorAll("[data-template-panel]"))
  const patternPanels = Array.from(root.querySelectorAll("[data-template-pattern-panel]"))
  const searchInput = root.querySelector("[data-template-search]")
  const searchResults = root.querySelector("[data-template-search-results]")
  const outline = root.querySelector("[data-template-outline]")
  const redirects = collectRedirects(root)
  const targetMap = new Map([
    ...patternControls.map((control) => [control.dataset.guideTarget || "", { type: "pattern", element: control }]),
    ...variantControls.map((control) => [control.dataset.guideTarget || "", { type: "variant", element: control }])
  ].filter(([target]) => target))
  const normalizeTarget = (target) => (targetMap.has(target) ? target : redirects.get(target) || target)

  if (patternControls.length === 0) {
    return
  }

  let activeLanguage = root.dataset.templateDefaultLanguage || "java"
  const searchSequence = createSequenceGuard()
  const defaultTarget = normalizeTarget(root.dataset.templateDefault || patternControls[0].dataset.guideTarget || "")

  const renderLanguage = (panel, nextLanguage) => {
    const controls = Array.from(panel.querySelectorAll("[data-code-collection-language-control]"))
    const selectedControl = controls.find((control) => control.dataset.codeCollectionLanguage === nextLanguage) || controls[0]
    const selectedLanguage = selectedControl?.dataset.codeCollectionLanguage || nextLanguage

    activeLanguage = selectedLanguage

    if (selectedControl && selectedControl.getAttribute("aria-pressed") !== "true") {
      selectedControl.click()
    }
  }

  const setPattern = (patternId) => {
    patternControls.forEach((control) => {
      const isActive = control.dataset.guidePattern === patternId
      control.classList.toggle("is-active", isActive)
      control.classList.toggle("side-panel__link--active", isActive)
      control.setAttribute("aria-expanded", isActive ? "true" : "false")
    })

    branches.forEach((branch) => {
      const isActive = branch.dataset.guidePattern === patternId
      branch.classList.toggle("is-active", isActive)
      branch.querySelector(".template-library__children")?.toggleAttribute("hidden", !isActive)
    })
  }

  const setVariant = (target) => {
    variantControls.forEach((control) => {
      const isActive = control.dataset.guideTarget === target
      control.classList.toggle("is-active", isActive)
      control.classList.toggle("side-panel__link--active", isActive)
      control.setAttribute("aria-pressed", isActive ? "true" : "false")
    })
  }

  const setPatternPanel = (patternId, showPattern) => {
    patternPanels.forEach((panel) => {
      const isActive = showPattern && panel.dataset.guidePattern === patternId
      panel.hidden = !isActive
      panel.classList.toggle("is-active", isActive)
    })
  }

  const setTemplate = (target) => {
    let activePanel = null
    templatePanels.forEach((panel) => {
      const isActive = panel.dataset.guideTarget === target
      panel.hidden = !isActive
      panel.classList.toggle("is-active", isActive)
      if (isActive) {
        activePanel = panel
      }
    })

    if (activePanel) {
      renderLanguage(activePanel, activeLanguage)
    }
  }

  const renderTarget = (rawTarget, { updateHash = true } = {}) => {
    const target = normalizeTarget(rawTarget)
    const targetRecord = targetMap.get(target) || targetMap.get(defaultTarget)
    if (!targetRecord) {
      return
    }

    const control = targetRecord.element
    const patternId = control.dataset.guidePattern || target
    const showPattern = targetRecord.type === "pattern"
    const renderableTarget = targetRecord.type === "variant" && control.dataset.guideHasTemplate === "true"
      ? target
      : control.dataset.guideDefaultTarget || target

    root.dataset.templateActive = target
    root.dataset.templateRendered = showPattern ? target : renderableTarget
    root.dataset.guidePattern = patternId

    setPattern(patternId)
    setVariant(showPattern ? "" : renderableTarget)
    setPatternPanel(patternId, showPattern)
    setTemplate(showPattern ? "" : renderableTarget)
    renderSearch()

    const activeControl = showPattern
      ? control
      : variantControls.find((control) => control.dataset.guideTarget === renderableTarget) || control
    activeControl.scrollIntoView({ block: "nearest" })

    if (updateHash || target !== rawTarget) {
      replaceHashValue(target)
    }
  }

  const renderDefaultNavigation = () => {
    outline?.toggleAttribute("hidden", false)
    if (searchResults) {
      searchResults.hidden = true
      searchResults.replaceChildren()
    }

    branches.forEach((branch) => {
      branch.hidden = false
      branch.querySelector(".template-library__children")?.toggleAttribute("hidden", !branch.classList.contains("is-active"))
      branch.querySelectorAll("[data-guide-variant-control]").forEach((control) => {
        control.hidden = control.dataset.guideHasTemplate !== "true"
      })
    })
  }

  const templateResult = (data) => {
    const link = document.createElement("a")
    link.className = "template-library__search-result"
    link.href = data.url
    link.dataset.guideChoiceTarget = data.meta?.target || ""

    const label = document.createElement("span")
    label.className = "template-library__search-result-label"
    label.textContent = data.meta?.title || data.url
    link.append(label)

    if (data.meta?.summary) {
      const summary = document.createElement("span")
      summary.className = "template-library__search-result-summary"
      summary.textContent = data.meta.summary
      link.append(summary)
    }

    return link
  }

  const renderTemplateResults = async (query, currentSequence) => {
    if (!searchResults) {
      return
    }

    outline?.toggleAttribute("hidden", true)
    searchResults.hidden = false
    searchResults.textContent = "Searching."

    let records
    try {
      records = await loadPagefindRecords(query, { filters: { kind: "Template" }, limit: 10 })
      if (!searchSequence.matches(currentSequence)) {
        return
      }
    } catch (error) {
      if (searchSequence.matches(currentSequence)) {
        searchResults.textContent = "Template search is unavailable."
      }
      console.error(error)
      return
    }

    if (records.length === 0) {
      searchResults.textContent = "No templates match."
      return
    }

    searchResults.replaceChildren(...records.map(templateResult))
  }

  const renderSearch = () => {
    const query = normalizeSearchQuery(searchInput?.value).toLowerCase()
    const currentSequence = searchSequence.next()

    if (!query || !meaningfulSearchQuery(query)) {
      renderDefaultNavigation()
      return
    }

    renderTemplateResults(query, currentSequence)
  }

  root.addEventListener("click", (event) => {
    const guideControl = event.target.closest("[data-guide-pattern-control], [data-guide-variant-control]")
    if (guideControl) {
      renderTarget(guideControl.dataset.guideTarget || "")
      return
    }

    const choice = event.target.closest("[data-guide-choice-target]")
    if (choice) {
      event.preventDefault()
      if (searchResults?.contains(choice) && searchInput) {
        searchInput.value = ""
      }
      renderTarget(choice.dataset.guideChoiceTarget || "")
      return
    }

    const control = event.target.closest("[data-code-collection-language-control]")
    if (!control) {
      return
    }

    activeLanguage = control.dataset.codeCollectionLanguage || activeLanguage
  })

  searchInput?.addEventListener("input", renderSearch)

  window.addEventListener("hashchange", () => {
    const nextTarget = getHashValue()
    if (nextTarget) {
      renderTarget(nextTarget, { updateHash: false })
    }
  })

  renderSearch()
  const hashTarget = getHashValue()
  renderTarget(hashTarget || defaultTarget, { updateHash: !hashTarget })
}

onReady(() => {
  document.querySelectorAll("[data-template-library]").forEach(initializeTemplateLibrary)
})
