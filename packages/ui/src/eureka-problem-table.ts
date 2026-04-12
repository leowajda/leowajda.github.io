import { Effect } from "effect"
import { Browser, addEventListener, type Cleanup, combineCleanups } from "./browser"
import {
  decodeFilterButton,
  decodeProblemRow,
  type FilterKind,
  type ProblemRowModel
} from "./eureka-model"

type ProblemTableState = {
  readonly search: string
  readonly difficulty: string
  readonly categories: ReadonlySet<string>
  readonly language: string
}

const createProblemTableState = (language: string): ProblemTableState => ({
  search: "",
  difficulty: "",
  categories: new Set<string>(),
  language
})

const toggleSingleSelect = (currentValue: string, nextValue: string) =>
  currentValue === nextValue ? "" : nextValue

const toggleCategory = (categories: ReadonlySet<string>, value: string): ReadonlySet<string> => {
  if (value === "") {
    return new Set<string>()
  }

  const nextCategories = new Set(categories)
  if (nextCategories.has(value)) {
    nextCategories.delete(value)
    return nextCategories
  }

  nextCategories.add(value)
  return nextCategories
}

const matchesProblemRow = (state: ProblemTableState, row: ProblemRowModel) =>
  (!state.search || row.searchTitle.includes(state.search))
  && (!state.difficulty || row.difficulty === state.difficulty)
  && (!state.language || row.languages.includes(state.language))
  && (state.categories.size === 0 || row.categories.some((category) => state.categories.has(category)))

export const initializeProblemTable = Effect.gen(function* () {
  const browser = yield* Browser
  const table = browser.document.getElementById("problem-table")
  if (!table) {
    return () => {}
  }

  const searchInput = browser.document.querySelector<HTMLInputElement>("[data-search-input]")
  const filterButtons = yield* Effect.forEach(
    Array.from(browser.document.querySelectorAll<HTMLButtonElement>("[data-filter-kind]")),
    decodeFilterButton
  )
  const summary = {
    visible: browser.document.querySelector<HTMLElement>("[data-visible-count]"),
    total: browser.document.querySelector<HTMLElement>("[data-total-count]")
  }

  const rows = yield* Effect.forEach(
    Array.from(table.querySelectorAll<HTMLElement>("[data-problem-row]")),
    decodeProblemRow
  )
  const defaultLanguage = table.dataset.languageFilter || ""
  let state = createProblemTableState(defaultLanguage)

  const syncSingleSelectButtons = (kind: Exclude<FilterKind, "clear" | "category">, activeValue: string) => {
    filterButtons.forEach((button) => {
      if (button.kind !== kind) {
        return
      }

      button.element.classList.toggle("is-active", button.value === activeValue || (!activeValue && button.value === ""))
    })
  }

  const syncCategoryButtons = () => {
    filterButtons.forEach((button) => {
      if (button.kind !== "category") {
        return
      }

      const isActive = button.value === "" ? state.categories.size === 0 : state.categories.has(button.value)
      button.element.classList.toggle("is-active", isActive)
    })
  }

  const activateDefaults = () => {
    filterButtons.forEach((button) => {
      if (button.kind === "difficulty" && button.value === "") {
        button.element.classList.add("is-active")
      }

      if (button.kind === "language" && button.value === state.language) {
        button.element.classList.add("is-active")
      }

      if (button.kind === "category" && button.value === "") {
        button.element.classList.add("is-active")
      }
    })
  }

  const render = () => {
    let visibleCount = 0

    rows.forEach((row) => {
      const matches = matchesProblemRow(state, row)
      row.element.hidden = !matches
      if (matches) {
        visibleCount += 1
      }
    })

    if (summary.visible) {
      summary.visible.textContent = String(visibleCount)
    }

    if (summary.total) {
      summary.total.textContent = String(rows.length)
    }
  }

  const cleanups: Array<Cleanup> = []

  if (searchInput) {
    cleanups.push(yield* addEventListener(searchInput, "input", () => {
      state = {
        ...state,
        search: searchInput.value.trim().toLowerCase()
      }
      render()
    }))
  }

  for (const button of filterButtons) {
    cleanups.push(yield* addEventListener(button.element, "click", () => {
      const { kind, value } = button

      if (kind === "clear") {
        state = createProblemTableState(defaultLanguage)

        if (searchInput) {
          searchInput.value = ""
        }

        filterButtons.forEach((item) => item.element.classList.remove("is-active"))
        activateDefaults()
        render()
        return
      }

      if (kind === "category") {
        state = {
          ...state,
          categories: toggleCategory(state.categories, value)
        }
        syncCategoryButtons()
      } else if (kind === "difficulty" || kind === "language") {
        state = {
          ...state,
          [kind]: toggleSingleSelect(state[kind], value)
        }
        syncSingleSelectButtons(kind, state[kind])
      }

      render()
    }))
  }

  activateDefaults()
  render()
  return combineCleanups(cleanups)
})
