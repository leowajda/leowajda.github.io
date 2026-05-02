import { onReady } from "./dom.js"
import { loadPagefindRecords, pagefindFilter } from "./pagefind-client.js"
import { createSequenceGuard, meaningfulSearchQuery, normalizeSearchQuery, normalizedPath } from "./search-query.js"

const PROBLEM_SEARCH_DEBOUNCE_MS = 160
const problemSearchCache = new Map()

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

const parseListMetadata = (value) => {
  try {
    const parsed = JSON.parse(value || "[]")
    return Array.isArray(parsed) ? parsed.filter(Boolean) : []
  } catch {
    return []
  }
}

const readProblemRow = (element) => ({
  element,
  url: normalizedPath(element.dataset.searchUrl || ""),
  difficulty: element.dataset.difficulty || "",
  categories: parseListMetadata(element.dataset.categories),
  languages: parseListMetadata(element.dataset.languages)
})

const languageSearchValue = (input) =>
  input.dataset.searchFilterValue || input.value

const activeSearch = (state) =>
  state.queryActive
  || state.difficulty
  || state.categories.length > 0
  || state.languageFilterActive

const searchFilters = (state) => {
  const filters = {
    kind: ["Problem"]
  }

  if (state.difficulty) {
    filters.difficulty = [state.difficulty]
  }

  if (state.categories.length > 0) {
    filters.category = state.categories
  }

  if (state.languageFilterActive) {
    filters.language = state.selectedLanguageLabels
  }

  return filters
}

const searchResultUrls = async (query, filters) => {
  const cacheKey = JSON.stringify([query, filters])
  if (!problemSearchCache.has(cacheKey)) {
    problemSearchCache.set(
      cacheKey,
      loadPagefindRecords(query, { filters: pagefindFilter(filters) })
        .then((records) => new Set(records.map((record) => normalizedPath(record.url))))
        .catch((error) => {
          problemSearchCache.delete(cacheKey)
          throw error
        })
    )
  }

  return problemSearchCache.get(cacheKey)
}

const initializeProblemFilters = () => {
  const form = document.querySelector("[data-problem-filters]")
  const table = document.getElementById("problem-table")
  if (!form || !table) {
    return
  }

  const activeFilterList = document.querySelector("[data-active-filter-list]")
  const emptyState = document.querySelector("[data-problem-empty]")
  const searchInput = form.querySelector('input[name="search"]')
  const languageInputs = Array.from(form.querySelectorAll('input[name="language"]'))
  const languageCells = Array.from(table.querySelectorAll("[data-language-column]"))
  const rows = Array.from(table.querySelectorAll("[data-problem-row]")).map(readProblemRow)
  const sequence = createSequenceGuard()
  const defaultEmptyMessage = emptyState?.textContent || "No problems match the current search."
  let renderDebounce

  const readSelectedLanguages = () => {
    if (languageInputs.length === 0) {
      return []
    }

    const selected = languageInputs.filter((input) => input.checked)
    if (selected.length > 0) {
      return selected
    }

    languageInputs.forEach((input) => {
      input.checked = true
    })
    return languageInputs
  }

  const renderLanguageColumns = (selectedLanguages) => {
    if (languageCells.length === 0) {
      return
    }

    const selectedSlugs = selectedLanguages.map((input) => input.value)
    table.style.setProperty("--visible-language-count", String(Math.max(selectedSlugs.length, 1)))
    languageCells.forEach((cell) => {
      const columnLanguage = cell.dataset.languageColumn || ""
      cell.hidden = selectedSlugs.length > 0 && !selectedSlugs.includes(columnLanguage)
    })
  }

  const readState = () => {
    const selectedLanguages = readSelectedLanguages()
    const selectedLanguageSlugs = selectedLanguages.map((input) => input.value)
    const selectedLanguageLabels = selectedLanguages.map(languageSearchValue)
    const languageFilterActive = languageInputs.length > 0 && selectedLanguages.length < languageInputs.length
    const query = normalizeSearchQuery(searchInput?.value)

    return {
      query,
      queryActive: meaningfulSearchQuery(query),
      difficulty: queryCheckedRadio(form, "difficulty"),
      categories: queryCheckedValues(form, "category"),
      selectedLanguages,
      selectedLanguageSlugs,
      selectedLanguageLabels,
      languageFilterActive
    }
  }

  const renderActiveFilters = (state) => {
    if (!activeFilterList) {
      return
    }

    const filters = []

    if (state.queryActive) {
      filters.push({ kind: "search", value: state.query, label: `Search: ${state.query}` })
    }

    if (state.difficulty) {
      filters.push({ kind: "difficulty", value: state.difficulty, label: `Difficulty: ${state.difficulty}` })
    }

    for (const category of state.categories) {
      filters.push({ kind: "category", value: category, label: `Category: ${category}` })
    }

    if (state.languageFilterActive) {
      state.selectedLanguages.forEach((input) => {
        filters.push({ kind: "language", value: input.value, label: `Language: ${languageSearchValue(input)}` })
      })
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

  const renderRows = (visibleUrls = null) => {
    let visibleCount = 0
    rows.forEach((row) => {
      const visible = !visibleUrls || visibleUrls.has(row.url)
      row.element.hidden = !visible
      if (visible) {
        visibleCount += 1
      }
    })

    if (emptyState) {
      emptyState.textContent = defaultEmptyMessage
      emptyState.hidden = visibleCount > 0
    }
  }

  const renderSearchUnavailable = () => {
    if (emptyState) {
      emptyState.textContent = "Problem search is unavailable."
      emptyState.hidden = false
    }

    rows.forEach((row) => {
      row.element.hidden = true
    })
  }

  const rowMatchesLocalFilters = (row, state) => {
    const difficultyMatches = !state.difficulty || row.difficulty === state.difficulty
    const categoryMatches = state.categories.length === 0
      || state.categories.some((category) => row.categories.includes(category))
    const languageMatches = !state.languageFilterActive
      || state.selectedLanguageSlugs.some((language) => row.languages.includes(language))

    return difficultyMatches && categoryMatches && languageMatches
  }

  const localFilterUrls = (state) =>
    new Set(
      rows
        .filter((row) => rowMatchesLocalFilters(row, state))
        .map((row) => row.url)
    )

  const render = async () => {
    const state = readState()
    renderLanguageColumns(state.selectedLanguages)
    renderActiveFilters(state)

    const currentSequence = sequence.next()

    if (!activeSearch(state)) {
      renderRows()
      return
    }

    const localUrls = localFilterUrls(state)
    if (!state.queryActive) {
      renderRows(localUrls)
      return
    }

    let searchUrls
    try {
      searchUrls = await searchResultUrls(state.query, searchFilters(state))
    } catch (error) {
      if (sequence.matches(currentSequence)) {
        renderSearchUnavailable()
      }
      console.error(error)
      return
    }

    if (!sequence.matches(currentSequence)) {
      return
    }

    renderRows(searchUrls)
  }

  const scheduleRender = () => {
    window.clearTimeout(renderDebounce)
    renderDebounce = window.setTimeout(render, PROBLEM_SEARCH_DEBOUNCE_MS)
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
        case "language":
          setCheckboxValue(form, "language", filterValue, false)
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

  form.addEventListener("input", (event) => {
    if (event.target === searchInput) {
      scheduleRender()
      return
    }

    render()
  })
  form.addEventListener("change", (event) => {
    if (event.target === searchInput) {
      return
    }

    render()
  })
  form.addEventListener("reset", () => {
    window.clearTimeout(renderDebounce)
    window.setTimeout(render, 0)
  })

  render()
}

onReady(initializeProblemFilters)
