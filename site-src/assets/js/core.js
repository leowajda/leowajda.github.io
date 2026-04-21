const themeStorageKey = "leowajda.github.io-theme"

const onReady = (callback) => {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback, { once: true })
    return
  }

  callback()
}

const getStoredTheme = () => {
  try {
    const stored = window.localStorage.getItem(themeStorageKey)
    return stored === "light" || stored === "dark" ? stored : null
  } catch {
    return null
  }
}

const getThemeRoot = () => document.documentElement

const resolveTheme = () => {
  const attribute = getThemeRoot().getAttribute("a") || "auto"
  if (attribute === "light" || attribute === "dark") {
    return attribute
  }

  return typeof window.matchMedia === "function" && window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light"
}

const applyTheme = (theme) => {
  const root = getThemeRoot()
  root.setAttribute("a", theme)
  root.style.colorScheme = theme
}

const updateThemeButton = (button) => {
  const currentTheme = resolveTheme()
  const nextTheme = currentTheme === "dark" ? "light" : "dark"
  const icon = button.querySelector(".icon-action__icon use, .theme-toggle__icon use")

  if (icon) {
    icon.setAttribute("href", `#icon-theme-${nextTheme}`)
  }

  button.setAttribute("aria-label", `Switch to ${nextTheme} mode`)
  button.setAttribute("title", `Switch to ${nextTheme} mode`)
}

const initializeThemeToggle = () => {
  const storedTheme = getStoredTheme()
  if (storedTheme) {
    applyTheme(storedTheme)
  } else {
    getThemeRoot().style.colorScheme = resolveTheme()
  }

  const button = document.querySelector("[data-theme-toggle]")
  if (!button) {
    return
  }

  updateThemeButton(button)
  button.addEventListener("click", () => {
    const nextTheme = resolveTheme() === "dark" ? "light" : "dark"
    applyTheme(nextTheme)

    try {
      window.localStorage.setItem(themeStorageKey, nextTheme)
    } catch {
      // Ignore storage failures and keep the applied theme for the current page.
    }

    updateThemeButton(button)
  })
}

const initializeBackButton = () => {
  const button = document.querySelector("[data-back-button]")
  if (!button) {
    return
  }

  let referrerUrl = null

  try {
    if (document.referrer) {
      const parsed = new URL(document.referrer)
      if (parsed.origin === window.location.origin) {
        referrerUrl = parsed
      }
    }
  } catch {
    referrerUrl = null
  }

  if (!referrerUrl) {
    button.hidden = true
    return
  }

  button.hidden = false
  button.setAttribute("aria-label", "Back to previous page")
  button.setAttribute("title", "Back to previous page")
  button.addEventListener("click", () => {
    window.history.back()
  })
}

const findCodeText = (button) => {
  const root = button.closest("[data-code-block]")
  if (!root) {
    return ""
  }

  const candidates = Array.from(root.querySelectorAll("[data-code-source] .highlight code, [data-code-source] code"))
  const visible = candidates.find((code) => !code.closest("[hidden]"))
  return visible?.innerText || candidates[0]?.innerText || ""
}

const setCopyButtonLabel = (button, label) => {
  button.setAttribute("aria-label", label)
}

const setCopyButtonState = (button, state, label) => {
  button.classList.remove("is-success", "is-error")

  if (state) {
    button.classList.add(`is-${state}`)
  }

  setCopyButtonLabel(button, label)
}

const resetCopyButton = (button) => {
  const defaultLabel = button.dataset.copyDefaultLabel || "Copy"
  setCopyButtonState(button, null, defaultLabel)
}

const initializeCopyButtons = () => {
  for (const button of document.querySelectorAll("[data-code-copy-button]")) {
    resetCopyButton(button)
    button.addEventListener("click", () => {
      const codeText = findCodeText(button)
      if (!codeText || !navigator.clipboard) {
        setCopyButtonState(button, "error", "Copy failed")
        window.setTimeout(() => resetCopyButton(button), 1200)
        return
      }

      void navigator.clipboard.writeText(codeText)
        .then(() => {
          setCopyButtonState(button, "success", "Copied")
          window.setTimeout(() => resetCopyButton(button), 1200)
        })
        .catch(() => {
          setCopyButtonState(button, "error", "Copy failed")
          window.setTimeout(() => resetCopyButton(button), 1200)
        })
    })
  }
}

const initializeCodeCollections = () => {
  const collections = Array.from(document.querySelectorAll("[data-code-collection]"))

  collections.forEach((collection) => {
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
    const getHash = () => window.location.hash.replace(/^#/, "")

    const resolveItem = (entryId, language, variant) => {
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

    const setHash = (entryId) => {
      if (!syncHash || !entryId) {
        return
      }

      const nextUrl = new URL(window.location.href)
      nextUrl.hash = entryId
      window.history.replaceState({}, "", nextUrl)
    }

    const render = (item) => {
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

      setHash(activeEntryId)
    }

    languageControls.forEach((control) => {
      control.addEventListener("click", () => {
        const language = control.dataset.codeCollectionLanguage || ""
        const currentActive = items.find((item) => !item.hidden) || items[0]
        const next = resolveItem("", language, currentActive?.dataset.codeCollectionVariant || "")
        render(next)
      })
    })

    variantControls.forEach((control) => {
      control.addEventListener("click", () => {
        const variant = control.dataset.codeCollectionVariant || ""
        const currentActive = items.find((item) => !item.hidden) || items[0]
        const next = resolveItem("", currentActive?.dataset.codeCollectionLanguage || "", variant)
        render(next)
      })
    })

    const initialItem = resolveItem(syncHash ? decodeURIComponent(getHash()) : "", "", "")
    render(initialItem)

    if (syncHash) {
      window.addEventListener("hashchange", () => {
        const nextHash = decodeURIComponent(getHash())
        if (!nextHash || !itemMap.has(nextHash)) {
          return
        }
        render(itemMap.get(nextHash))
      })
    }
  })
}

const initializeSourceTree = () => {
  for (const activeLink of document.querySelectorAll(".source-tree__link[aria-current='page']")) {
    let current = activeLink.parentElement

    while (current) {
      if (current.tagName === "DETAILS") {
        current.open = true
      }

      current = current.parentElement
    }
  }
}

onReady(() => {
  initializeThemeToggle()
  initializeBackButton()
  initializeCopyButtons()
  initializeCodeCollections()
  initializeSourceTree()
})
