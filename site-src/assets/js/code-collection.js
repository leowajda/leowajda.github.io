import { getHashValue, onHashChange, replaceHashValue } from "./dom.js"

const initializeCodeCollection = (root) => {
  const items = [...root.querySelectorAll("[data-code-collection-item]")]
  if (items.length === 0) {
    return
  }

  const languages = [...root.querySelectorAll("[data-code-collection-language-control]")]
  const variants = [...root.querySelectorAll("[data-code-collection-variant-control]")]
  const variantGroup = root.querySelector("[data-code-collection-variant-group]")
  const actions = [...root.querySelectorAll("[data-code-collection-actions-for]")]
  const byId = new Map(items.map((item) => [item.dataset.codeCollectionEntryId, item]))
  const syncHash = root.dataset.codeCollectionSyncHash === "true"
  const fallback = byId.get(root.dataset.codeCollectionDefaultEntry) || items[0]

  const show = (item) => {
    if (!item) {
      return
    }

    const language = item.dataset.codeCollectionLanguage
    const variant = item.dataset.codeCollectionVariant
    const entryId = item.dataset.codeCollectionEntryId

    items.forEach((candidate) => {
      candidate.hidden = candidate !== item
    })
    actions.forEach((group) => {
      group.hidden = group.dataset.codeCollectionActionsFor !== entryId
    })
    languages.forEach((control) => {
      const active = control.dataset.codeCollectionLanguage === language
      control.classList.toggle("is-active", active)
      control.setAttribute("aria-pressed", active ? "true" : "false")
    })

    let available = 0
    variants.forEach((control) => {
      const value = control.dataset.codeCollectionVariant
      const ok = items.some((candidate) =>
        candidate.dataset.codeCollectionLanguage === language
        && candidate.dataset.codeCollectionVariant === value
      )
      control.disabled = !ok
      control.classList.toggle("is-unavailable", !ok)
      control.setAttribute("aria-disabled", ok ? "false" : "true")
      if (ok) {
        available += 1
      }
      const active = ok && value === variant
      control.classList.toggle("is-active", active)
      control.setAttribute("aria-pressed", active ? "true" : "false")
    })

    if (variantGroup) {
      const keep = variantGroup.dataset.codeCollectionKeepVisible === "true"
      variantGroup.hidden = keep ? variants.length === 0 : variants.length < 2 || available === 0
    }

    if (syncHash && entryId) {
      replaceHashValue(entryId)
    }
  }

  const pick = (entryId, language, variant) => {
    if (entryId && byId.has(entryId)) {
      return byId.get(entryId)
    }
    if (language && variant) {
      const exact = items.find((item) =>
        item.dataset.codeCollectionLanguage === language
        && item.dataset.codeCollectionVariant === variant
      )
      if (exact) {
        return exact
      }
    }
    if (language) {
      return items.find((item) => item.dataset.codeCollectionLanguage === language) || fallback
    }
    return fallback
  }

  root.addEventListener("click", (event) => {
    const languageControl = event.target.closest("[data-code-collection-language-control]")
    if (languageControl) {
      const current = items.find((item) => !item.hidden) || fallback
      show(pick("", languageControl.dataset.codeCollectionLanguage, current.dataset.codeCollectionVariant))
      return
    }

    const variantControl = event.target.closest("[data-code-collection-variant-control]")
    if (variantControl) {
      const current = items.find((item) => !item.hidden) || fallback
      show(pick("", current.dataset.codeCollectionLanguage, variantControl.dataset.codeCollectionVariant))
    }
  })

  show(pick(syncHash ? getHashValue() : "", "", ""))

  if (syncHash) {
    onHashChange(() => {
      const hash = getHashValue()
      if (hash && byId.has(hash)) {
        show(byId.get(hash))
      }
    })
  }
}

export const initializeCodeCollections = () => {
  document.querySelectorAll("[data-code-collection]").forEach(initializeCodeCollection)
}
