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

const setRadioValue = (form, name, value) => {
  const target = form.querySelector(`input[name="${name}"][value="${CSS.escape(value)}"]`)
    || form.querySelector(`input[name="${name}"][value=""]`)
  if (target) {
    target.checked = true
  }
}

const setCheckboxValue = (form, name, value, checked) => {
  const target = form.querySelector(`input[name="${name}"][value="${CSS.escape(value)}"]`)
  if (target) {
    target.checked = checked
  }
}

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
  const activeFilterList = document.querySelector("[data-active-filter-list]")
  const searchInput = form.querySelector('input[name="search"]')
  const languageInputs = Array.from(form.querySelectorAll('input[name="language"]'))
  const languageCells = Array.from(table.querySelectorAll("[data-language-column]"))
  const categoryOptions = Array.from(form.querySelectorAll("[data-category-option]"))
  const categoryEmpty = form.querySelector("[data-category-empty]")
  const defaultLanguage = table.dataset.languageFilter || ""
  const rows = Array.from(table.querySelectorAll("[data-problem-row]")).map(readProblemRow)

  const readSelectedLanguages = () => {
    if (languageInputs.length === 0) {
      return []
    }

    const selected = languageInputs.filter((input) => input.checked).map((input) => input.value)
    if (selected.length > 0) {
      return selected
    }

    languageInputs.forEach((input) => {
      input.checked = true
    })
    return languageInputs.map((input) => input.value)
  }

  const renderLanguageColumns = (selectedLanguages) => {
    if (languageCells.length === 0) {
      return
    }

    table.style.setProperty("--visible-language-count", String(Math.max(selectedLanguages.length, 1)))
    languageCells.forEach((cell) => {
      const columnLanguage = cell.dataset.languageColumn || ""
      cell.hidden = selectedLanguages.length > 0 && !selectedLanguages.includes(columnLanguage)
    })
  }

  const renderCategoryOptions = () => {
    if (categoryOptions.length === 0) {
      return
    }

    let visibleCount = 0

    categoryOptions.forEach((option) => {
      option.hidden = false
      visibleCount += 1
    })

    if (categoryEmpty) {
      categoryEmpty.hidden = visibleCount !== 0
    }
  }

  const renderActiveFilters = (state) => {
    if (!activeFilterList) {
      return
    }

    const filters = []
    const trimmedSearch = searchInput?.value.trim() ?? ""

    if (trimmedSearch) {
      filters.push({ kind: "search", value: trimmedSearch, label: `Search: ${trimmedSearch}` })
    }

    if (state.difficulty) {
      filters.push({ kind: "difficulty", value: state.difficulty, label: `Difficulty: ${state.difficulty}` })
    }

    for (const category of state.categories) {
      filters.push({ kind: "category", value: category, label: `Category: ${category}` })
    }

    activeFilterList.replaceChildren()

    if (filters.length === 0) {
      activeFilterList.hidden = true
      return
    }

    filters.forEach((filter) => {
      const button = document.createElement("button")
      button.type = "button"
      button.className = "active-filter"
      button.dataset.filterKind = filter.kind
      button.dataset.filterValue = filter.value
      button.textContent = filter.label
      activeFilterList.append(button)
    })

    const clearAllButton = document.createElement("button")
    clearAllButton.type = "button"
    clearAllButton.className = "active-filter active-filter--clear"
    clearAllButton.dataset.filterKind = "clear"
    clearAllButton.textContent = "Clear all"
    activeFilterList.append(clearAllButton)
    activeFilterList.hidden = false
  }

  const render = () => {
    renderCategoryOptions()
    const selectedLanguages = readSelectedLanguages()
    renderLanguageColumns(selectedLanguages)

    let state = createProblemTableState(defaultLanguage)

    if (searchInput) {
      state = reduceProblemTableState(state, { type: "search", value: searchInput.value })
    }

    state = reduceProblemTableState(state, { type: "difficulty", value: queryCheckedRadio(form, "difficulty") })

    for (const category of queryCheckedValues(form, "category")) {
      state = reduceProblemTableState(state, { type: "category", value: category })
    }

    let visibleCount = 0

    rows.forEach((row) => {
      const matchesLanguage = selectedLanguages.length === 0
        || row.languages.some((language) => selectedLanguages.includes(language))
      const matches = matchesProblemRow(state, row) && matchesLanguage
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

    renderActiveFilters(state)
  }

  if (activeFilterList) {
    activeFilterList.addEventListener("click", (event) => {
      const button = event.target.closest("[data-filter-kind]")
      if (!(button instanceof HTMLButtonElement)) {
        return
      }

      const { filterKind, filterValue = "" } = button.dataset

      switch (filterKind) {
        case "search":
          if (searchInput) {
            searchInput.value = ""
          }
          break
        case "difficulty":
          setRadioValue(form, "difficulty", "")
          break
        case "category":
          setCheckboxValue(form, "category", filterValue, false)
          break
        case "clear":
          form.reset()
          break
        default:
          return
      }

      render()
    })
  }

  form.addEventListener("input", render)
  form.addEventListener("change", render)
  form.addEventListener("reset", () => {
    window.setTimeout(render, 0)
  })

  render()
}

onReady(initializeProblemFilters)
