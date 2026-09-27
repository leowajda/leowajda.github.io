import { onReady } from "./dom.js"
import {
  createSequenceGuard,
  loadPagefindRecords,
  meaningfulSearchQuery,
  normalizeSearchQuery,
  normalizedPath,
  pagefindFilter
} from "./pagefind.js"

const DEBOUNCE_MS = 160
const cache = new Map()

const checkedRadio = (form, name) =>
  form.querySelector(`input[name="${name}"]:checked`)?.value ?? ""

const checkedValues = (form, name) =>
  Array.from(form.querySelectorAll(`input[name="${name}"]:checked`))
    .map((input) => input.value)
    .filter(Boolean)

const anyFilter = (values) =>
  values.length === 1 ? values[0] : { any: values }

const languageLabel = (input) =>
  input.dataset.searchFilterValue || input.value

const fetchUrls = async (query, filters) => {
  const key = JSON.stringify([query, filters])
  if (!cache.has(key)) {
    cache.set(
      key,
      loadPagefindRecords(query, { filters: pagefindFilter(filters) })
        .then((records) => new Set(records.map((record) => normalizedPath(record.url))))
        .catch((error) => {
          cache.delete(key)
          throw error
        })
    )
  }
  return cache.get(key)
}

const initializeProblemFilters = () => {
  const form = document.querySelector("[data-problem-filters]")
  const table = document.getElementById("problem-table")
  if (!form || !table) {
    return
  }

  const empty = document.querySelector("[data-problem-empty]")
  const searchInput = form.querySelector('input[name="search"]')
  const languageInputs = Array.from(form.querySelectorAll('input[name="language"]'))
  const languageCells = Array.from(table.querySelectorAll("[data-language-column]"))
  const rows = Array.from(table.querySelectorAll("[data-problem-row]")).map((element) => ({
    element,
    url: normalizedPath(element.dataset.searchUrl || "")
  }))
  const sequence = createSequenceGuard()
  const emptyDefault = empty?.textContent || "No problems match the current search."
  let debounce

  const selectedLanguages = () => {
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

  const state = () => {
    const languages = selectedLanguages()
    const query = normalizeSearchQuery(searchInput?.value)
    return {
      query,
      queryActive: meaningfulSearchQuery(query),
      difficulty: checkedRadio(form, "difficulty"),
      categories: checkedValues(form, "category"),
      languages,
      languageFilterActive: languageInputs.length > 0 && languages.length < languageInputs.length
    }
  }

  const paintColumns = (languages) => {
    if (languageCells.length === 0) {
      return
    }
    const slugs = languages.map((input) => input.value)
    table.style.setProperty("--visible-language-count", String(Math.max(slugs.length, 1)))
    languageCells.forEach((cell) => {
      const column = cell.dataset.languageColumn || ""
      cell.hidden = slugs.length > 0 && !slugs.includes(column)
    })
  }

  const paintRows = (visible) => {
    let count = 0
    rows.forEach((row) => {
      const show = visible(row)
      row.element.hidden = !show
      if (show) {
        count += 1
      }
    })
    if (empty) {
      empty.textContent = emptyDefault
      empty.hidden = count > 0
    }
  }

  const filtersFor = (current) => {
    const filters = { kind: "Problem" }
    if (current.difficulty) {
      filters.difficulty = current.difficulty
    }
    if (current.categories.length > 0) {
      filters.category = anyFilter(current.categories)
    }
    if (current.languageFilterActive) {
      filters.language = anyFilter(current.languages.map(languageLabel))
    }
    return filters
  }

  const filtered = (current) =>
    current.queryActive
    || Boolean(current.difficulty)
    || current.categories.length > 0
    || current.languageFilterActive

  const render = async () => {
    const current = state()
    paintColumns(current.languages)
    const token = sequence.next()

    if (!filtered(current)) {
      paintRows(() => true)
      return
    }

    try {
      const urls = await fetchUrls(current.queryActive ? current.query : null, filtersFor(current))
      if (!sequence.matches(token)) {
        return
      }
      paintRows((row) => urls.has(row.url))
    } catch (error) {
      if (sequence.matches(token) && empty) {
        empty.textContent = "Problem search is unavailable."
        empty.hidden = false
      }
      rows.forEach((row) => {
        row.element.hidden = true
      })
      console.error(error)
    }
  }

  const schedule = () => {
    window.clearTimeout(debounce)
    debounce = window.setTimeout(render, DEBOUNCE_MS)
  }

  form.addEventListener("input", (event) => {
    if (event.target === searchInput) {
      schedule()
      return
    }
    render()
  })
  form.addEventListener("change", (event) => {
    if (event.target !== searchInput) {
      render()
    }
  })
  form.addEventListener("reset", () => {
    window.clearTimeout(debounce)
    window.setTimeout(render, 0)
  })

  render()
}

onReady(initializeProblemFilters)
