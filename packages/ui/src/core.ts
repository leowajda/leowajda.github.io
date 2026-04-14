const themeStorageKey = "leowajda.github.io-theme"

type Theme = "light" | "dark"

const onReady = (callback: () => void) => {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback, { once: true })
    return
  }

  callback()
}

const getStoredTheme = (): Theme | null => {
  try {
    const stored = window.localStorage.getItem(themeStorageKey)
    return stored === "light" || stored === "dark" ? stored : null
  } catch {
    return null
  }
}

const resolveTheme = (): Theme => {
  const attribute = document.body.getAttribute("a") || "auto"
  if (attribute === "light" || attribute === "dark") {
    return attribute
  }

  return typeof window.matchMedia === "function" && window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light"
}

const applyTheme = (theme: Theme) => {
  document.body.setAttribute("a", theme)
}

const updateThemeButton = (button: HTMLButtonElement) => {
  const currentTheme = resolveTheme()
  const nextTheme: Theme = currentTheme === "dark" ? "light" : "dark"
  const icon = button.querySelector<SVGUseElement>(".theme-toggle__icon use")

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
  }

  const button = document.querySelector<HTMLButtonElement>("[data-theme-toggle]")
  if (!button) {
    return
  }

  updateThemeButton(button)
  button.addEventListener("click", () => {
    const nextTheme: Theme = resolveTheme() === "dark" ? "light" : "dark"
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
  const button = document.querySelector<HTMLButtonElement>("[data-back-button]")
  if (!button) {
    return
  }

  let referrerUrl: URL | null = null

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

const findCodeText = (button: HTMLButtonElement) => {
  const root = button.closest<HTMLElement>("[data-code-block]")
  if (!root) {
    return ""
  }

  const code = root.querySelector<HTMLElement>("[data-code-source] .highlight code, [data-code-source] code")
  return code ? code.innerText : ""
}

const setCopyButtonLabel = (button: HTMLButtonElement, label: string) => {
  button.textContent = label
  button.setAttribute("aria-label", label)
  button.setAttribute("title", label)
}

const resetCopyButton = (button: HTMLButtonElement) => {
  const defaultLabel = button.dataset.copyDefaultLabel || "copy"
  button.textContent = defaultLabel
  button.setAttribute("aria-label", defaultLabel)
  button.setAttribute("title", defaultLabel)
}

const initializeCopyButtons = () => {
  for (const button of document.querySelectorAll<HTMLButtonElement>("[data-code-copy-button]")) {
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
