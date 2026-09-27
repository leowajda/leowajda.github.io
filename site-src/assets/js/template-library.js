import { selectCodeLanguage } from "./code-collection.js"
import { getHashValue, onHashChange, onReady, replaceHashValue } from "./dom.js"

const initializeTemplateLibrary = (root) => {
  const patternLinks = [...root.querySelectorAll("[data-guide-pattern-control]")]
  const variantLinks = [...root.querySelectorAll("[data-guide-variant-control]")]
  const templatePanels = [...root.querySelectorAll("[data-template-panel]")]
  const patternPanels = [...root.querySelectorAll("[data-template-pattern-panel]")]
  if (patternLinks.length === 0) {
    return
  }

  const redirects = new Map(
    [...root.querySelectorAll("[data-template-redirect]")]
      .map((node) => [node.dataset.templateRedirectSource, node.dataset.templateRedirectTarget])
      .filter(([source, target]) => source && target)
  )

  const targets = new Map()
  patternLinks.forEach((el) => targets.set(el.dataset.guideTarget, { kind: "pattern", el }))
  variantLinks.forEach((el) => targets.set(el.dataset.guideTarget, { kind: "variant", el }))

  const resolve = (raw) => {
    const token = decodeURIComponent((raw || "").replace(/\+/g, " "))
    return targets.has(token) ? token : redirects.get(token) || token
  }

  const defaultTarget = resolve(root.dataset.templateDefault || patternLinks[0].dataset.guideTarget)
  let language = root.dataset.templateDefaultLanguage || "java"

  const showLanguage = (panel) => {
    const collection = panel.querySelector("[data-code-collection]")
    if (!collection) {
      return
    }
    const preferred = collection.querySelector(
      `[data-code-collection-language-control][data-code-collection-language="${language}"]`
    ) || collection.querySelector("[data-code-collection-language-control]")
    if (!preferred) {
      return
    }
    language = preferred.dataset.codeCollectionLanguage || language
    selectCodeLanguage(collection, language)
  }

  const paint = (raw, { syncHash = true } = {}) => {
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

    patternLinks.forEach((link) => {
      const on = link.dataset.guidePattern === patternId
      link.classList.toggle("is-active", on)
      if (on) {
        link.setAttribute("aria-current", "true")
      } else {
        link.removeAttribute("aria-current")
      }
    })

    root.querySelectorAll("[data-guide-sibling]").forEach((link) => {
      const on = !isPattern && link.dataset.guideSibling === renderTarget
      if (on) {
        link.setAttribute("aria-current", "true")
      } else {
        link.removeAttribute("aria-current")
      }
    })

    patternPanels.forEach((panel) => {
      const on = isPattern && panel.dataset.guidePattern === patternId
      panel.hidden = !on
    })

    let activePanel = null
    templatePanels.forEach((panel) => {
      const on = !isPattern && panel.dataset.guideTarget === renderTarget
      panel.hidden = !on
      if (on) {
        activePanel = panel
      }
    })
    if (activePanel) {
      showLanguage(activePanel)
    }

    if (syncHash) {
      const nextHash = isPattern ? target : renderTarget
      if (getHashValue() !== nextHash) {
        replaceHashValue(nextHash)
      }
    }
  }

  root.addEventListener("click", (event) => {
    const nav = event.target.closest("[data-guide-pattern-control], [data-guide-variant-control], [data-guide-sibling]")
    if (nav) {
      event.preventDefault()
      paint(nav.dataset.guideTarget || nav.dataset.guideSibling || "")
      return
    }

    const lang = event.target.closest("[data-code-collection-language-control]")
    if (lang) {
      language = lang.dataset.codeCollectionLanguage || language
    }
  })

  onHashChange(() => {
    const next = getHashValue()
    if (next) {
      paint(next, { syncHash: false })
    }
  })

  const initial = getHashValue()
  const resolvedInitial = initial ? resolve(initial) : defaultTarget
  paint(resolvedInitial, { syncHash: !initial || resolvedInitial !== initial })
}

onReady(() => {
  document.querySelectorAll("[data-template-library]").forEach(initializeTemplateLibrary)
})
