import { getHashValue, onHashChange, onReady, replaceHashValue } from "./dom.js"
import {
  createSequenceGuard,
  loadPagefindRecords,
  meaningfulSearchQuery,
  normalizeSearchQuery
} from "./pagefind.js"

const initializeTemplateLibrary = (root) => {
  const patternControls = [...root.querySelectorAll("[data-guide-pattern-control]")]
  const variantControls = [...root.querySelectorAll("[data-guide-variant-control]")]
  const branches = [...root.querySelectorAll("[data-guide-branch]")]
  const templatePanels = [...root.querySelectorAll("[data-template-panel]")]
  const patternPanels = [...root.querySelectorAll("[data-template-pattern-panel]")]
  const searchInput = root.querySelector("[data-template-search]")
  const searchResults = root.querySelector("[data-template-search-results]")
  const outline = root.querySelector("[data-template-outline]")
  if (patternControls.length === 0) {
    return
  }

  const redirects = new Map(
    [...root.querySelectorAll("[data-template-redirect]")]
      .map((node) => [node.dataset.templateRedirectSource, node.dataset.templateRedirectTarget])
      .filter(([source, target]) => source && target)
  )

  const targets = new Map()
  patternControls.forEach((el) => targets.set(el.dataset.guideTarget, { kind: "pattern", el }))
  variantControls.forEach((el) => targets.set(el.dataset.guideTarget, { kind: "variant", el }))

  const resolve = (raw) => (targets.has(raw) ? raw : redirects.get(raw) || raw)
  const defaultTarget = resolve(root.dataset.templateDefault || patternControls[0].dataset.guideTarget)
  let language = root.dataset.templateDefaultLanguage || "java"
  const sequence = createSequenceGuard()

  const showLanguage = (panel) => {
    const control = panel.querySelector(`[data-code-collection-language-control][data-code-collection-language="${language}"]`)
      || panel.querySelector("[data-code-collection-language-control]")
    if (control) {
      language = control.dataset.codeCollectionLanguage || language
      if (control.getAttribute("aria-pressed") !== "true") {
        control.click()
      }
    }
  }

  const paint = (raw, { hash = true } = {}) => {
    const target = resolve(raw)
    const record = targets.get(target) || targets.get(defaultTarget)
    if (!record) {
      return
    }

    const { kind, el } = record
    const patternId = el.dataset.guidePattern || target
    const isPattern = kind === "pattern"
    const renderTarget = !isPattern && el.dataset.guideHasTemplate === "true"
      ? target
      : el.dataset.guideDefaultTarget || target

    patternControls.forEach((control) => {
      const on = control.dataset.guidePattern === patternId
      control.classList.toggle("is-active", on)
      control.classList.toggle("side-panel__link--active", on)
      control.setAttribute("aria-expanded", on ? "true" : "false")
    })

    branches.forEach((branch) => {
      const on = branch.dataset.guidePattern === patternId
      branch.classList.toggle("is-active", on)
      branch.querySelector(".template-library__children")?.toggleAttribute("hidden", !on)
    })

    variantControls.forEach((control) => {
      const on = !isPattern && control.dataset.guideTarget === renderTarget
      control.classList.toggle("is-active", on)
      control.classList.toggle("side-panel__link--active", on)
      control.setAttribute("aria-pressed", on ? "true" : "false")
    })

    patternPanels.forEach((panel) => {
      const on = isPattern && panel.dataset.guidePattern === patternId
      panel.hidden = !on
      panel.classList.toggle("is-active", on)
    })

    let activePanel = null
    templatePanels.forEach((panel) => {
      const on = !isPattern && panel.dataset.guideTarget === renderTarget
      panel.hidden = !on
      panel.classList.toggle("is-active", on)
      if (on) {
        activePanel = panel
      }
    })
    if (activePanel) {
      showLanguage(activePanel)
    }

    const focus = isPattern
      ? el
      : variantControls.find((control) => control.dataset.guideTarget === renderTarget) || el
    focus.scrollIntoView({ block: "nearest" })

    if (hash || target !== raw) {
      replaceHashValue(target)
    }
  }

  const showOutline = () => {
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

  const search = async () => {
    const query = normalizeSearchQuery(searchInput?.value)
    const token = sequence.next()
    if (!meaningfulSearchQuery(query)) {
      showOutline()
      return
    }
    if (!searchResults) {
      return
    }
    outline?.toggleAttribute("hidden", true)
    searchResults.hidden = false
    searchResults.textContent = "Searching."
    try {
      const records = await loadPagefindRecords(query, { filters: { kind: "Template" }, limit: 10 })
      if (!sequence.matches(token)) {
        return
      }
      if (records.length === 0) {
        searchResults.textContent = "No templates match."
        return
      }
      searchResults.replaceChildren(...records.map((data) => {
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
      }))
    } catch (error) {
      if (sequence.matches(token)) {
        searchResults.textContent = "Template search is unavailable."
      }
      console.error(error)
    }
  }

  root.addEventListener("click", (event) => {
    const guide = event.target.closest("[data-guide-pattern-control], [data-guide-variant-control]")
    if (guide) {
      paint(guide.dataset.guideTarget || "")
      return
    }
    const choice = event.target.closest("[data-guide-choice-target]")
    if (choice) {
      event.preventDefault()
      if (searchResults?.contains(choice) && searchInput) {
        searchInput.value = ""
        search()
      }
      paint(choice.dataset.guideChoiceTarget || "")
      return
    }
    const lang = event.target.closest("[data-code-collection-language-control]")
    if (lang) {
      language = lang.dataset.codeCollectionLanguage || language
    }
  })

  searchInput?.addEventListener("input", search)
  onHashChange(() => {
    const next = getHashValue()
    if (next) {
      paint(next, { hash: false })
    }
  })

  search()
  const initial = getHashValue()
  paint(initial || defaultTarget, { hash: !initial })
}

onReady(() => {
  document.querySelectorAll("[data-template-library]").forEach(initializeTemplateLibrary)
})
