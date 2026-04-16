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
  const icon = button.querySelector(".theme-toggle__icon use")

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

  const code = root.querySelector("[data-code-source] .highlight code, [data-code-source] code")
  return code ? code.innerText : ""
}

const setCopyButtonLabel = (button, label) => {
  button.textContent = label
  button.setAttribute("aria-label", label)
  button.setAttribute("title", label)
}

const resetCopyButton = (button) => {
  const defaultLabel = button.dataset.copyDefaultLabel || "copy"
  button.textContent = defaultLabel
  button.setAttribute("aria-label", defaultLabel)
  button.setAttribute("title", defaultLabel)
}

const initializeCopyButtons = () => {
  for (const button of document.querySelectorAll("[data-code-copy-button]")) {
    resetCopyButton(button)
    button.addEventListener("click", () => {
      const codeText = findCodeText(button)
      if (!codeText || !navigator.clipboard) {
        setCopyButtonLabel(button, "copy failed")
        window.setTimeout(() => resetCopyButton(button), 1200)
        return
      }

      void navigator.clipboard.writeText(codeText)
        .then(() => {
          setCopyButtonLabel(button, "copied")
          window.setTimeout(() => resetCopyButton(button), 1200)
        })
        .catch(() => {
          setCopyButtonLabel(button, "copy failed")
          window.setTimeout(() => resetCopyButton(button), 1200)
        })
    })
  }
}

onReady(() => {
  initializeThemeToggle()
  initializeBackButton()
  initializeCopyButtons()
})
