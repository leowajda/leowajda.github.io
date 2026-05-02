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

const applyTheme = (theme) => {
  const root = getThemeRoot()
  root.setAttribute("data-appearance", theme)
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

export const initializeThemeToggle = () => {
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
