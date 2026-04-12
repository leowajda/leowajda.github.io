import renderMathInElement from "katex/contrib/auto-render"
import { Effect } from "effect"
import { Browser, BrowserLive, addEventListener, type BrowserService, type Cleanup, combineCleanups } from "./browser"
import { initializeCodeReferences } from "./code-references"
import { initializeEurekaUi } from "./eureka-controller"

const themeStorageKey = "leowajda.github.io-theme"
const noopCleanup: Cleanup = () => {}

type Theme = "light" | "dark"

const runBrowserAction = (
  browser: BrowserService,
  label: string,
  effect: Effect.Effect<void, unknown, Browser>
) => {
  Effect.runSync(
    effect.pipe(
      Effect.provideService(Browser, browser),
      Effect.catchAllCause((cause) =>
        Effect.sync(() => {
          browser.console.error(`Failed to ${label}`, cause)
        })
      )
    )
  )
}

const getStoredTheme = Effect.gen(function* () {
  const browser = yield* Browser
  const stored = browser.localStorage?.getItem(themeStorageKey)
  return stored === "light" || stored === "dark" ? stored : null
})

const resolveTheme = Effect.gen(function* () {
  const browser = yield* Browser
  const attribute = browser.document.body.getAttribute("a") || "auto"
  if (attribute === "light" || attribute === "dark") {
    return attribute
  }

  return typeof browser.window.matchMedia === "function" && browser.window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light"
})

const applyTheme = (theme: Theme) =>
  Effect.gen(function* () {
    const browser = yield* Browser
    browser.document.body.setAttribute("a", theme)
  })

const updateThemeButton = (button: HTMLButtonElement) =>
  Effect.gen(function* () {
    const currentTheme = yield* resolveTheme
    const nextTheme: Theme = currentTheme === "dark" ? "light" : "dark"
    const icon = button.querySelector<SVGUseElement>(".theme-toggle__icon use")

    if (icon) {
      icon.setAttribute("href", `#icon-theme-${nextTheme}`)
    }

    button.setAttribute("aria-label", `Switch to ${nextTheme} mode`)
    button.setAttribute("title", `Switch to ${nextTheme} mode`)
  })

const initializeThemeToggle = Effect.gen(function* () {
  const browser = yield* Browser
  const button = browser.document.querySelector<HTMLButtonElement>("[data-theme-toggle]")
  if (!button) {
    return noopCleanup
  }

  yield* updateThemeButton(button)
  return yield* addEventListener(button, "click", () => {
    runBrowserAction(
      browser,
      "update theme",
      Effect.gen(function* () {
        const nextTheme = (yield* resolveTheme) === "dark" ? "light" : "dark"
        yield* applyTheme(nextTheme)
        browser.localStorage?.setItem(themeStorageKey, nextTheme)
        yield* updateThemeButton(button)
      })
    )
  })
})

const initializeBackButton = Effect.gen(function* () {
  const browser = yield* Browser
  const button = browser.document.querySelector<HTMLButtonElement>("[data-back-button]")
  if (!button) {
    return noopCleanup
  }

  let referrerUrl: URL | null = null

  try {
    const referrer = browser.document.referrer
    if (referrer) {
      const parsed = new URL(referrer)
      if (parsed.origin === browser.location.origin) {
        referrerUrl = parsed
      }
    }
  } catch {
    referrerUrl = null
  }

  if (!referrerUrl) {
    button.hidden = true
    return noopCleanup
  }

  button.hidden = false
  button.setAttribute("aria-label", "Back to previous page")
  button.setAttribute("title", "Back to previous page")
  return yield* addEventListener(button, "click", () => {
    browser.history.back()
  })
})

const resetCopyButtonLabel = (button: HTMLButtonElement, label: string) => {
  button.setAttribute("title", label)
  button.setAttribute("aria-label", label)
}

const initializeCopyButtons = Effect.gen(function* () {
  const browser = yield* Browser
  const cleanups: Array<Cleanup> = []

  for (const button of browser.document.querySelectorAll<HTMLButtonElement>("[data-code-copy-button]")) {
    if (button.dataset.copyReady === "true") {
      continue
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

    cleanups.push(yield* addEventListener(button, "click", () => {
      const codeText = findCodeText()
      if (!codeText || !browser.navigator.clipboard) {
        resetCopyButtonLabel(button, "Copy failed")
        browser.window.setTimeout(() => resetCopyButtonLabel(button, "Copy code"), 1200)
        return
      }

      void browser.navigator.clipboard.writeText(codeText)
        .then(() => {
          resetCopyButtonLabel(button, "Copied")
          browser.window.setTimeout(() => resetCopyButtonLabel(button, "Copy code"), 1200)
        })
        .catch(() => {
          resetCopyButtonLabel(button, "Copy failed")
          browser.window.setTimeout(() => resetCopyButtonLabel(button, "Copy code"), 1200)
        })
    }))
  }

  return combineCleanups(cleanups)
})

const initializeSourceSidebar = Effect.gen(function* () {
  const browser = yield* Browser
  const sidebar = browser.document.querySelector<HTMLElement>(".source-sidebar")
  if (!sidebar) {
    return noopCleanup
  }

  const activeLink = sidebar.querySelector<HTMLElement>(".source-tree__link.is-active")
  if (!activeLink) {
    return noopCleanup
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

  return noopCleanup
})

const initializeMath = Effect.gen(function* () {
  const browser = yield* Browser
  renderMathInElement(browser.document.body, {
    delimiters: [
      { left: "$$", right: "$$", display: true },
      { left: "\\[", right: "\\]", display: true },
      { left: "$", right: "$", display: false },
      { left: "\\(", right: "\\)", display: false }
    ],
    throwOnError: false,
    ignoredTags: ["script", "noscript", "style", "textarea", "pre", "code"]
  })

  return noopCleanup
})

const initializeSafely = (label: string, effect: Effect.Effect<Cleanup, unknown, Browser>) =>
  Effect.gen(function* () {
    const browser = yield* Browser
    return yield* effect.pipe(
      Effect.catchAllCause((cause) =>
        Effect.sync(() => {
          browser.console.error(`Failed to initialize ${label}`, cause)
          return noopCleanup
        })
      )
    )
  })

const start = Effect.gen(function* () {
  const browser = yield* Browser
  const storedTheme = yield* getStoredTheme
  if (storedTheme) {
    yield* applyTheme(storedTheme)
  }

  const cleanups = yield* Effect.all([
    initializeSafely("theme toggle", initializeThemeToggle),
    initializeSafely("back button", initializeBackButton),
    initializeSafely("copy buttons", initializeCopyButtons),
    initializeSafely("code references", initializeCodeReferences),
    initializeSafely("source sidebar", initializeSourceSidebar),
    initializeSafely("math rendering", initializeMath),
    initializeSafely("Eureka UI", initializeEurekaUi)
  ])

  const cleanup = combineCleanups(cleanups)
  yield* addEventListener(browser.window, "pagehide", cleanup, { once: true })
})

const program = start.pipe(Effect.provide(BrowserLive))

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    Effect.runSync(program)
  }, { once: true })
} else {
  Effect.runSync(program)
}
