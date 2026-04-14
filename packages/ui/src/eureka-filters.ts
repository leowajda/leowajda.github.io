import {
  createProblemTableState,
  matchesProblemRow,
  reduceProblemTableState,
  type ProblemRowModel
} from "./eureka-problem-table-state"

const onReady = (callback: () => void) => {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback, { once: true })
    return
  }

  callback()
}

const queryCheckedRadio = (form: HTMLFormElement, name: string) =>
  form.querySelector<HTMLInputElement>(`input[name="${name}"]:checked`)?.value ?? ""

const queryCheckedValues = (form: HTMLFormElement, name: string) =>
  Array.from(form.querySelectorAll<HTMLInputElement>(`input[name="${name}"]:checked`))
    .map((input) => input.value)
    .filter(Boolean)

const readProblemRow = (element: HTMLElement): ProblemRowModel => ({
  element,
  searchTitle: (element.dataset.searchTitle || "").toLowerCase(),
  difficulty: element.dataset.difficulty || "",
  languages: element.dataset.languages ? element.dataset.languages.split("|").filter(Boolean) : [],
  categories: element.dataset.categories ? element.dataset.categories.split("|").filter(Boolean) : []
})

const initializeProblemFilters = () => {
  const form = document.querySelector<HTMLFormElement>("[data-problem-filters]")
  const table = document.getElementById("problem-table")
  if (!form || !table) {
    return
  }

  const summaryVisible = document.querySelector<HTMLElement>("[data-visible-count]")
  const summaryTotal = document.querySelector<HTMLElement>("[data-total-count]")
  const searchInput = form.querySelector<HTMLInputElement>('input[name="search"]')
  const defaultLanguage = table.dataset.languageFilter || ""
  const rows = Array.from(table.querySelectorAll<HTMLElement>("[data-problem-row]")).map(readProblemRow)

  const render = () => {
    let state = createProblemTableState(defaultLanguage)

    if (searchInput) {
      state = reduceProblemTableState(state, { type: "search", value: searchInput.value })
    }

    state = reduceProblemTableState(state, { type: "difficulty", value: queryCheckedRadio(form, "difficulty") })

    if (!defaultLanguage) {
      state = reduceProblemTableState(state, { type: "language", value: queryCheckedRadio(form, "language") })
    }

    for (const category of queryCheckedValues(form, "category")) {
      state = reduceProblemTableState(state, { type: "category", value: category })
    }

    let visibleCount = 0

    rows.forEach((row) => {
      const matches = matchesProblemRow(state, row)
      row.element.hidden = !matches
      if (matches) {
        visibleCount += 1
      }
    })

    if (summaryVisible) {
      summaryVisible.textContent = String(visibleCount)
    }

    if (summaryTotal) {
      summaryTotal.textContent = String(rows.length)
    }
  }

  form.addEventListener("input", render)
  form.addEventListener("change", render)
  form.addEventListener("reset", () => {
    window.setTimeout(render, 0)
  })

  render()
}

onReady(initializeProblemFilters)
