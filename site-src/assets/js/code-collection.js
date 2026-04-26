import { getHashValue, replaceHashValue } from "./dom.js"

const resolveCollectionItem = ({ entryId, language, variant, itemMap, defaultEntryId, items }) => {
  if (entryId && itemMap.has(entryId)) {
    return itemMap.get(entryId)
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
    const byLanguage = items.find((item) => item.dataset.codeCollectionLanguage === language)
    if (byLanguage) {
      return byLanguage
    }
  }

  return itemMap.get(defaultEntryId) || items[0]
}

const renderCollectionItem = ({
  item,
  items,
  languageControls,
  variantControls,
  variantGroup,
  actionGroups,
  syncHash
}) => {
  if (!item) {
    return
  }

  const activeEntryId = item.dataset.codeCollectionEntryId || ""
  const activeLanguage = item.dataset.codeCollectionLanguage || ""
  const activeVariant = item.dataset.codeCollectionVariant || ""

  items.forEach((candidate) => {
    candidate.hidden = candidate !== item
  })

  actionGroups.forEach((group) => {
    group.hidden = group.dataset.codeCollectionActionsFor !== activeEntryId
  })

  languageControls.forEach((control) => {
    const isActive = control.dataset.codeCollectionLanguage === activeLanguage
    control.classList.toggle("is-active", isActive)
    control.setAttribute("aria-pressed", isActive ? "true" : "false")
  })

  let visibleVariantCount = 0
  variantControls.forEach((control) => {
    const variant = control.dataset.codeCollectionVariant || ""
    const baseLabel = control.dataset.codeCollectionVariantLabel || variant || "Variant"
    const isAvailable = items.some((candidate) =>
      candidate.dataset.codeCollectionLanguage === activeLanguage
      && candidate.dataset.codeCollectionVariant === variant
    )
    control.disabled = !isAvailable
    control.classList.toggle("is-unavailable", !isAvailable)
    control.setAttribute("aria-disabled", isAvailable ? "false" : "true")
    control.setAttribute("title", isAvailable ? baseLabel : `${baseLabel} unavailable`)
    if (isAvailable) {
      visibleVariantCount += 1
    }
    const isActive = isAvailable && variant === activeVariant
    control.classList.toggle("is-active", isActive)
    control.setAttribute("aria-pressed", isActive ? "true" : "false")
  })

  if (variantGroup) {
    const keepVariantGroupVisible = variantGroup.dataset.codeCollectionKeepVisible === "true"
    variantGroup.hidden = keepVariantGroupVisible
      ? variantControls.length === 0
      : variantControls.length < 2 || visibleVariantCount === 0
  }

  if (syncHash && activeEntryId) {
    replaceHashValue(activeEntryId)
  }
}

const initializeCodeCollection = (collection) => {
  const items = Array.from(collection.querySelectorAll("[data-code-collection-item]"))
  if (items.length === 0) {
    return
  }

  const languageControls = Array.from(collection.querySelectorAll("[data-code-collection-language-control]"))
  const variantControls = Array.from(collection.querySelectorAll("[data-code-collection-variant-control]"))
  const variantGroup = collection.querySelector("[data-code-collection-variant-group]")
  const actionGroups = Array.from(collection.querySelectorAll("[data-code-collection-actions-for]"))
  const itemMap = new Map(items.map((item) => [item.dataset.codeCollectionEntryId || "", item]))
  const syncHash = collection.dataset.codeCollectionSyncHash === "true"
  const defaultEntryId = collection.dataset.codeCollectionDefaultEntry || items[0].dataset.codeCollectionEntryId || ""
  const render = (item) => {
    renderCollectionItem({
      item,
      items,
      languageControls,
      variantControls,
      variantGroup,
      actionGroups,
      syncHash
    })
  }
  const resolveItem = (entryId, language, variant) => resolveCollectionItem({
    entryId,
    language,
    variant,
    itemMap,
    defaultEntryId,
    items
  })

  languageControls.forEach((control) => {
    control.addEventListener("click", () => {
      const language = control.dataset.codeCollectionLanguage || ""
      const currentActive = items.find((item) => !item.hidden) || items[0]
      render(resolveItem("", language, currentActive?.dataset.codeCollectionVariant || ""))
    })
  })

  variantControls.forEach((control) => {
    control.addEventListener("click", () => {
      const variant = control.dataset.codeCollectionVariant || ""
      const currentActive = items.find((item) => !item.hidden) || items[0]
      render(resolveItem("", currentActive?.dataset.codeCollectionLanguage || "", variant))
    })
  })

  render(resolveItem(syncHash ? getHashValue() : "", "", ""))

  if (syncHash) {
    window.addEventListener("hashchange", () => {
      const nextHash = getHashValue()
      if (!nextHash || !itemMap.has(nextHash)) {
        return
      }
      render(itemMap.get(nextHash))
    })
  }
}

export const initializeCodeCollections = () => {
  document.querySelectorAll("[data-code-collection]").forEach(initializeCodeCollection)
}
