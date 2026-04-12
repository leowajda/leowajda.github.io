import { Effect } from "effect"
import { Browser, addEventListener, type Cleanup, combineCleanups } from "./browser"
import {
  decodeLanguagePanel,
  type LanguagePanelModel
} from "./eureka-model"
import { initializeProblemTable } from "./eureka-problem-table"

const getDefaultImplementation = (languagePanels: Array<HTMLElement>, language: string) => {
  const panel = languagePanels.find((item) => item.dataset.language === language)
  if (!panel) {
    return ""
  }

  const firstImplementation = panel.querySelector<HTMLElement>("[data-implementation-panel]")
  return firstImplementation ? firstImplementation.id : ""
}

const initializeProblemShells = Effect.gen(function* () {
  const browser = yield* Browser
  const cleanups: Array<Cleanup> = []

  for (const shell of browser.document.querySelectorAll<HTMLElement>("[data-problem-shell]")) {
    const languageButtons = Array.from(shell.querySelectorAll<HTMLButtonElement>("[data-language-target]"))
    const languagePanels = yield* Effect.forEach(
      Array.from(shell.querySelectorAll<HTMLElement>("[data-language-panel]")),
      decodeLanguagePanel
    )

    if (!languageButtons.length || !languagePanels.length) {
      continue
    }

    const implementationMap = new Map<string, { language: string; implementationId: string }>()
    languagePanels.forEach((panel) => {
      panel.element.querySelectorAll<HTMLElement>("[data-implementation-panel]").forEach((implementationPanel) => {
        implementationMap.set(implementationPanel.id, {
          language: panel.language,
          implementationId: implementationPanel.id
        })
      })
    })

    const params = new URLSearchParams(browser.location.search)
    const requestedImplementation = params.get("implementation") || ""
    const requestedLanguage = params.get("language") || ""
    const initial = implementationMap.get(requestedImplementation)
    const initialLanguage = initial?.language
      || (requestedLanguage && languagePanels.some((panel) => panel.language === requestedLanguage)
        ? requestedLanguage
        : (languagePanels[0]?.language || ""))
    const initialImplementation = initial?.implementationId || getDefaultImplementation(languagePanels.map((panel) => panel.element), initialLanguage)

    const activateImplementation = (panel: HTMLElement, implementationId: string) => {
      const implementationButtons = Array.from(panel.querySelectorAll<HTMLButtonElement>("[data-implementation-target]"))
      const implementationPanels = Array.from(panel.querySelectorAll<HTMLElement>("[data-implementation-panel]"))
      const implementationActions = Array.from(panel.querySelectorAll<HTMLElement>("[data-implementation-actions]"))
      const nextImplementationId = implementationButtons.some((button) => button.dataset.implementationTarget === implementationId)
        ? implementationId
        : getDefaultImplementation(languagePanels.map((item) => item.element), panel.dataset.language || "")

      implementationButtons.forEach((button) => {
        const isActive = button.dataset.implementationTarget === nextImplementationId
        button.classList.toggle("is-active", isActive)
        button.setAttribute("aria-pressed", String(isActive))
      })

      implementationPanels.forEach((implementationPanel) => {
        implementationPanel.hidden = implementationPanel.id !== nextImplementationId
      })

      implementationActions.forEach((actions) => {
        actions.hidden = actions.dataset.implementationActions !== nextImplementationId
      })
    }

    const activateLanguage = (language: string, implementationId: string, updateUrl: boolean) => {
      languageButtons.forEach((button) => {
        const isActive = button.dataset.languageTarget === language
        button.classList.toggle("is-active", isActive)
        button.setAttribute("aria-pressed", String(isActive))
      })

      languagePanels.forEach((panel) => {
        panel.element.hidden = panel.language !== language
      })

      const activePanel = languagePanels.find((panel) => panel.language === language)
      if (!activePanel) {
        return
      }

      const nextImplementationId = implementationId || getDefaultImplementation(languagePanels.map((item) => item.element), language)
      activateImplementation(activePanel.element, nextImplementationId)

      if (updateUrl && nextImplementationId) {
        const url = new URL(browser.location.href)
        url.searchParams.set("language", language)
        url.searchParams.set("implementation", nextImplementationId)
        browser.history.replaceState(null, "", `${url.pathname}?${url.searchParams.toString()}${url.hash}`)
      }
    }

    activateLanguage(initialLanguage, initialImplementation, false)

    for (const button of languageButtons) {
      cleanups.push(yield* addEventListener(button, "click", () => {
        const targetLanguage = button.dataset.languageTarget || ""
        activateLanguage(targetLanguage, getDefaultImplementation(languagePanels.map((item) => item.element), targetLanguage), true)
      }))
    }

    for (const panel of languagePanels) {
      for (const button of panel.element.querySelectorAll<HTMLButtonElement>("[data-implementation-target]")) {
        cleanups.push(yield* addEventListener(button, "click", () => {
          activateLanguage(panel.language, button.dataset.implementationTarget || "", true)
        }))
      }
    }
  }

  return combineCleanups(cleanups)
})

export const initializeEurekaUi = Effect.gen(function* () {
  const cleanups = yield* Effect.all([
    initializeProblemTable,
    initializeProblemShells
  ])

  return combineCleanups(cleanups)
})
