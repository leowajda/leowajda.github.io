const themeStorageKey = "leowajda.github.io-theme"

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
  const attribute = getThemeRoot().getAttribute("data-appearance") || "auto"
  if (attribute === "light" || attribute === "dark") {
    return attribute
  }

  return typeof window.matchMedia === "function" && window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light"
}

const themeColorFor = (theme) => (theme === "dark" ? "#111111" : "#ffffff")

const applyResolvedTheme = (theme) => {
  const root = getThemeRoot()
  root.style.colorScheme = theme
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", themeColorFor(theme))
}

const applyTheme = (theme) => {
  const root = getThemeRoot()
  root.setAttribute("data-appearance", theme)
  applyResolvedTheme(theme)
}

const updateThemeButton = (button) => {
  const currentTheme = resolveTheme()
  const nextTheme = currentTheme === "dark" ? "light" : "dark"
  const icon = button.querySelector(".icon-action__icon use")

  if (icon) {
    icon.setAttribute("href", `#icon-theme-${nextTheme}`)
  }

  button.setAttribute("aria-label", `Switch to ${nextTheme} mode`)
  button.setAttribute("title", `Switch to ${nextTheme} mode`)
}

export const initializeThemeToggle = () => {
  const storedTheme = getStoredTheme()
  if (storedTheme) {
    applyTheme(storedTheme)
  } else {
    getThemeRoot().setAttribute("data-appearance", "auto")
    applyResolvedTheme(resolveTheme())
  }

  const button = document.querySelector("[data-theme-toggle]")
  const scheme = window.matchMedia("(prefers-color-scheme: dark)")
  scheme.addEventListener("change", () => {
    if (getStoredTheme()) {
      return
    }
    getThemeRoot().setAttribute("data-appearance", "auto")
    applyResolvedTheme(resolveTheme())
    if (button) {
      updateThemeButton(button)
    }
  })
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
