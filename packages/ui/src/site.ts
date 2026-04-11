import renderMathInElement from "katex/contrib/auto-render"
import { Effect } from "effect"
import { initializeEurekaUi } from "./eureka-controller"
import { initializeSourceGraphs } from "./source-graph"

const themeStorageKey = "leowajda.github.io-theme"

type Theme = "light" | "dark"

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

  if (typeof window.matchMedia === "function") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
  }

  return "light"
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
  const button = document.querySelector<HTMLButtonElement>("[data-theme-toggle]")
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
      // Ignore localStorage failures.
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
    const referrer = document.referrer
    if (referrer) {
      const parsed = new URL(referrer)
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

const initializeCopyButtons = () => {
  const buttons = document.querySelectorAll<HTMLButtonElement>("[data-code-copy-button]")
  buttons.forEach((button) => {
    if (button.dataset.copyReady === "true") {
      return
    }
    button.dataset.copyReady = "true"

    const findCodeText = () => {
      const shell = button.closest<HTMLElement>(".code-shell")
      if (!shell) {
        return ""
      }

      const visiblePanelCode = shell.querySelector<HTMLElement>(
        ".code-shell__panel:not([hidden]) .code-markdown .highlight code"
      )
      if (visiblePanelCode) {
        return visiblePanelCode.innerText
      }

      const fallback = shell.querySelector<HTMLElement>(".code-markdown .highlight code")
      return fallback ? fallback.innerText : ""
    }

    button.addEventListener("click", () => {
      const codeText = findCodeText()
      if (!codeText) {
        button.setAttribute("title", "Copy failed")
        button.setAttribute("aria-label", "Copy failed")
        window.setTimeout(() => {
          button.setAttribute("title", "Copy code")
          button.setAttribute("aria-label", "Copy code")
        }, 1200)
        return
      }

      void navigator.clipboard.writeText(codeText)
        .then(() => {
          button.setAttribute("title", "Copied")
          button.setAttribute("aria-label", "Copied")
          window.setTimeout(() => {
            button.setAttribute("title", "Copy code")
            button.setAttribute("aria-label", "Copy code")
          }, 1200)
        })
        .catch(() => {
          button.setAttribute("title", "Copy failed")
          button.setAttribute("aria-label", "Copy failed")
          window.setTimeout(() => {
            button.setAttribute("title", "Copy code")
            button.setAttribute("aria-label", "Copy code")
          }, 1200)
        })
    })
  })
}

const initializeSourceSidebar = () => {
  const sidebar = document.querySelector<HTMLElement>(".source-sidebar")
  if (!sidebar) {
    return
  }

  const activeLink = sidebar.querySelector<HTMLElement>(".source-tree__link.is-active")
  if (!activeLink) {
    return
  }

  const groups = Array.from(sidebar.querySelectorAll<HTMLDetailsElement>(".source-tree__group"))
  groups.forEach((group) => {
    group.open = false
  })

  let cursor: HTMLElement | null = activeLink
  while (cursor) {
    if (cursor instanceof HTMLDetailsElement && cursor.classList.contains("source-tree__group")) {
      cursor.open = true
    }
    cursor = cursor.parentElement
  }

  activeLink.scrollIntoView({
    block: "center",
    inline: "nearest"
  })
}

const initializeMath = () => {
  renderMathInElement(document.body, {
    delimiters: [
      { left: "$$", right: "$$", display: true },
      { left: "\\[", right: "\\]", display: true },
      { left: "$", right: "$", display: false },
      { left: "\\(", right: "\\)", display: false }
    ],
    throwOnError: false,
    ignoredTags: ["script", "noscript", "style", "textarea", "pre", "code"]
  })
}

const runSafely = (label: string, effect: () => void) => {
  try {
    effect()
  } catch (error) {
    console.error(`Failed to initialize ${label}`, error)
  }
}

const runEffectSafely = (label: string, effect: Effect.Effect<void, never>) => {
  Effect.runSync(
    Effect.catchAllCause(effect, (cause) =>
      Effect.sync(() => {
        console.error(`Failed to initialize ${label}`, cause)
      })
    )
  )
}

const start = () => {
  const storedTheme = getStoredTheme()
  if (storedTheme) {
    applyTheme(storedTheme)
  }

  runSafely("theme toggle", initializeThemeToggle)
  runSafely("back button", initializeBackButton)
  runSafely("copy buttons", initializeCopyButtons)
  runSafely("source sidebar", initializeSourceSidebar)
  runSafely("math rendering", initializeMath)
  runEffectSafely("source graphs", initializeSourceGraphs)

  try {
    initializeEurekaUi()
  } catch (error) {
    console.error("Failed to initialize Eureka UI", error)
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", start, { once: true })
} else {
  start()
}
