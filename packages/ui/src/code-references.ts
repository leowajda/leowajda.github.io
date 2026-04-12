import { Effect } from "effect"
import { Browser, addEventListener, type Cleanup, combineCleanups } from "./browser"

const visibleLabel = "Hide file references"
const hiddenLabel = "Show file references"

const updateToggle = (button: HTMLButtonElement, visible: boolean) => {
  button.classList.toggle("is-active", visible)
  button.setAttribute("aria-pressed", String(visible))
  button.setAttribute("aria-label", visible ? visibleLabel : hiddenLabel)
  button.setAttribute("title", visible ? visibleLabel : hiddenLabel)
}

export const initializeCodeReferences = Effect.gen(function* () {
  const browser = yield* Browser
  const cleanups: Array<Cleanup> = []

  for (const button of browser.document.querySelectorAll<HTMLButtonElement>("[data-code-references-toggle]")) {
    if (button.dataset.referencesReady === "true") {
      continue
    }
    button.dataset.referencesReady = "true"

    const controlsId = button.getAttribute("aria-controls")
    const target = controlsId ? browser.document.getElementById(controlsId) : null
    if (!(target instanceof HTMLElement)) {
      button.hidden = true
      continue
    }

    updateToggle(button, !target.hidden)
    cleanups.push(yield* addEventListener(button, "click", () => {
      target.hidden = !target.hidden
      updateToggle(button, !target.hidden)
    }))
  }

  return combineCleanups(cleanups)
})
