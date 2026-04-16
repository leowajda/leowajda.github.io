import {
  createProblemTableState,
  matchesProblemRow,
  reduceProblemTableState
} from "./eureka-problem-table-state.js"

const onReady = (callback) => {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback, { once: true })
    return
  }

  callback()
}

const queryCheckedRadio = (form, name) =>
  form.querySelector(`input[name="${name}"]:checked`)?.value ?? ""

const queryCheckedValues = (form, name) =>
  Array.from(form.querySelectorAll(`input[name="${name}"]:checked`))
    .map((input) => input.value)
    .filter(Boolean)

const readProblemRow = (element) => ({
  element,
  searchTitle: (element.dataset.searchTitle || "").toLowerCase(),
  difficulty: element.dataset.difficulty || "",
  languages: element.dataset.languages ? element.dataset.languages.split("|").filter(Boolean) : [],
  categories: element.dataset.categories ? element.dataset.categories.split("|").filter(Boolean) : []
})

const initializeProblemFilters = () => {
  const form = document.querySelector("[data-problem-filters]")
  const table = document.getElementById("problem-table")
  if (!form || !table) {
    return
  }

  const summaryVisible = document.querySelector("[data-visible-count]")
  const summaryTotal = document.querySelector("[data-total-count]")
  const searchInput = form.querySelector('input[name="search"]')
  const defaultLanguage = table.dataset.languageFilter || ""
  const rows = Array.from(table.querySelectorAll("[data-problem-row]")).map(readProblemRow)

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
