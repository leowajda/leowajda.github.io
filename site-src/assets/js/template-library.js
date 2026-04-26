import { getHashValue, onReady, replaceHashValue } from "./dom.js"

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
  const searchInput = root.querySelector("[data-template-search]")
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
      control.setAttribute("aria-pressed", isActive ? "true" : "false")
    })
  }

  const setTemplate = ({ target, patternId, showPattern }) => {
    const activePanels = []

    templatePanels.forEach((panel) => {
      const isActive = showPattern ? panel.dataset.guidePattern === patternId : panel.dataset.guideTarget === target
      panel.hidden = !isActive
      panel.classList.toggle("is-active", isActive)
      if (isActive) {
        activePanels.push(panel)
      }
    })

    activePanels.forEach((panel) => renderLanguage(panel, activeLanguage))
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
    setTemplate({ target: renderableTarget, patternId, showPattern })
    renderSearch()

    const activeControl = showPattern
      ? control
      : variantControls.find((control) => control.dataset.guideTarget === renderableTarget) || control
    activeControl.scrollIntoView({ block: "nearest" })

    if (updateHash || target !== rawTarget) {
      replaceHashValue(target)
    }
  }

  const renderSearch = () => {
    const query = (searchInput?.value || "").trim().toLowerCase()

    branches.forEach((branch) => {
      const pattern = branch.querySelector("[data-guide-pattern-control]")
      const children = branch.querySelector(".template-library__children")
      const variants = Array.from(branch.querySelectorAll("[data-guide-variant-control]"))
      const patternMatches = !query || (pattern?.dataset.guideSearchText || "").includes(query)
      let visibleVariantCount = 0

      variants.forEach((control) => {
        const hasTemplate = control.dataset.guideHasTemplate === "true"
        const matches = !query || patternMatches || (control.dataset.guideSearchText || "").includes(query)
        control.hidden = !hasTemplate || !matches
        if (hasTemplate && matches) {
          visibleVariantCount += 1
        }
      })

      branch.hidden = Boolean(query) && !patternMatches && visibleVariantCount === 0
      if (children) {
        children.hidden = Boolean(query) ? visibleVariantCount === 0 : !branch.classList.contains("is-active")
      }
    })
  }

  patternControls.forEach((control) => {
    control.addEventListener("click", () => renderTarget(control.dataset.guideTarget || ""))
  })

  variantControls.forEach((control) => {
    control.addEventListener("click", () => renderTarget(control.dataset.guideTarget || ""))
  })

  root.addEventListener("click", (event) => {
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
