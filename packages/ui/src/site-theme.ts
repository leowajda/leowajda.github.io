import { Effect } from "effect"
import { Browser, addEventListener, type BrowserService, type Cleanup } from "./browser"

const themeStorageKey = "leowajda.github.io-theme"

export type Theme = "light" | "dark"

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

export const restoreStoredTheme = Effect.gen(function* () {
  const storedTheme = yield* getStoredTheme
  if (storedTheme) {
    yield* applyTheme(storedTheme)
  }
})

export const initializeThemeToggle = (
  onError: (
    browser: BrowserService,
    label: string,
    effect: Effect.Effect<void, unknown, Browser>
  ) => void,
  noopCleanup: Cleanup
) =>
  Effect.gen(function* () {
    const browser = yield* Browser
    const button = browser.document.querySelector<HTMLButtonElement>("[data-theme-toggle]")
    if (!button) {
      return noopCleanup
    }

    yield* updateThemeButton(button)
    return yield* addEventListener(button, "click", () => {
      onError(
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
