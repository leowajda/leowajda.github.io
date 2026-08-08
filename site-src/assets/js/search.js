import { closestElement, isSearchRoute } from "./dom.js"
import {
  createSequenceGuard,
  loadPagefind,
  loadPagefindResultData,
  meaningfulSearchQuery,
  normalizeSearchQuery,
  preloadPagefind,
  searchPagefind
} from "./pagefind.js"

const SEARCH_PAGE_SIZE = 8

const resultMetaLine = (data) =>
  [data.meta?.kind, data.meta?.section].filter(Boolean).join(": ")

const createResultElement = (data, index) => {
  const option = document.createElement("div")
  option.className = "search-result"
  option.id = `site-search-option-${index}`
  option.setAttribute("role", "option")
  option.setAttribute("aria-selected", "false")

  const link = document.createElement("a")
  link.className = "search-result__link"
  link.href = data.url
  link.dataset.searchResultLink = ""
  link.tabIndex = -1

  const meta = document.createElement("p")
  meta.className = "search-result__meta"
  meta.textContent = resultMetaLine(data)

  const title = document.createElement("h2")
  title.className = "search-result__title"
  title.textContent = data.meta?.title || data.url

  const summary = document.createElement("p")
  summary.className = "search-result__summary"
  summary.textContent = data.meta?.summary || ""

  link.append(meta, title)
  if (summary.textContent) {
    link.append(summary)
  }
  option.append(link)
  return option
}

const createSearchResultSet = (search) => ({
  total: search.results.length,
  records: [],
  async loadThrough(count) {
    const results = search.results.slice(0, count)
    this.records = await Promise.all(results.map(loadPagefindResultData))
    return this.records
  }
})

const paintResults = ({ records, total = records.length, visibleCount, results, summary, moreButton }) => {
  if (total === 0) {
    summary.textContent = "No results."
    results.replaceChildren()
    moreButton.hidden = true
    return
  }
  summary.textContent = total === 1 ? "1 result." : `${total} results.`
  results.replaceChildren(...records.slice(0, visibleCount).map((record, index) => createResultElement(record, index)))
  moreButton.hidden = visibleCount >= total
  moreButton.textContent = `Show ${Math.min(SEARCH_PAGE_SIZE, total - visibleCount)} more`
}

let searchOverlay = null

const initializeSearchOverlay = () => {
  if (searchOverlay) {
    return searchOverlay
  }

  const dialog = document.querySelector("[data-search-overlay]")
  const input = dialog?.querySelector("[data-search-input]")
  const summary = dialog?.querySelector("[data-search-summary]")
  const results = dialog?.querySelector("[data-search-results]")
  const moreButton = dialog?.querySelector("[data-search-more]")

  if (!(dialog instanceof HTMLDialogElement) || !input || !summary || !results || !moreButton) {
    return null
  }

  let opener = null
  let resultSet = null
  let visibleCount = SEARCH_PAGE_SIZE
  let activeIndex = -1
  const sequence = createSequenceGuard()
  let debounce

  const resultLinks = () => Array.from(results.querySelectorAll("[data-search-result-link]"))
  const resultOptions = () => Array.from(results.querySelectorAll('[role="option"]'))

  const setExpanded = (expanded) => {
    input.setAttribute("aria-expanded", expanded ? "true" : "false")
  }

  const clearActiveOption = () => {
    activeIndex = -1
    input.removeAttribute("aria-activedescendant")
    resultOptions().forEach((option) => option.setAttribute("aria-selected", "false"))
  }

  const setActiveOption = (index) => {
    const options = resultOptions()
    if (options.length === 0) {
      clearActiveOption()
      return
    }
    activeIndex = Math.max(0, Math.min(index, options.length - 1))
    options.forEach((option, optionIndex) => {
      const active = optionIndex === activeIndex
      option.setAttribute("aria-selected", active ? "true" : "false")
      if (active) {
        input.setAttribute("aria-activedescendant", option.id)
        option.scrollIntoView({ block: "nearest" })
      }
    })
  }

  const moveActiveOption = (offset) => {
    const options = resultOptions()
    if (options.length === 0) {
      return
    }
    if (activeIndex === -1) {
      setActiveOption(offset > 0 ? 0 : options.length - 1)
      return
    }
    setActiveOption(activeIndex + offset)
  }

  const openActiveResult = () => {
    const links = resultLinks()
    if (links.length === 0) {
      return
    }
    const target = activeIndex >= 0 ? links[activeIndex] : links[0]
    if (target) {
      window.location.assign(target.href)
    }
  }

  const closeOverlay = () => {
    if (isSearchRoute()) {
      window.location.assign(document.body.dataset.pagefindBaseUrl || "/")
      return
    }
    dialog.close()
  }

  const render = async ({ resetVisibleCount = true } = {}) => {
    const query = normalizeSearchQuery(input.value)
    const currentSequence = sequence.next()
    if (resetVisibleCount) {
      visibleCount = SEARCH_PAGE_SIZE
    }
    clearActiveOption()

    if (!query) {
      resultSet = null
      summary.textContent = "Type to search."
      results.replaceChildren()
      moreButton.hidden = true
      return
    }

    if (!meaningfulSearchQuery(query)) {
      resultSet = null
      summary.textContent = "Type at least 2 characters."
      results.replaceChildren()
      moreButton.hidden = true
      return
    }

    summary.textContent = "Searching."
    try {
      const search = await searchPagefind(query)
      if (!sequence.matches(currentSequence)) {
        return
      }
      const nextResultSet = createSearchResultSet(search)
      const records = await nextResultSet.loadThrough(visibleCount)
      if (!sequence.matches(currentSequence)) {
        return
      }
      resultSet = nextResultSet
      paintResults({ records, total: resultSet.total, visibleCount, results, summary, moreButton })
    } catch (error) {
      summary.textContent = "Search index is unavailable."
      results.replaceChildren()
      moreButton.hidden = true
      console.error(error)
    }
  }

  const openOverlay = ({ query = input.value } = {}) => {
    opener = document.activeElement
    if (query !== input.value) {
      input.value = query
    }
    if (!dialog.open) {
      dialog.showModal()
    }
    setExpanded(true)
    loadPagefind().catch(() => {})
    input.focus()
    render()
  }

  dialog.querySelector("[data-search-close]")?.addEventListener("click", closeOverlay)
  dialog.addEventListener("cancel", (event) => {
    event.preventDefault()
    closeOverlay()
  })
  dialog.addEventListener("close", () => {
    setExpanded(false)
    clearActiveOption()
    if (opener instanceof HTMLElement && document.contains(opener)) {
      opener.focus()
    }
  })

  input.addEventListener("input", () => {
    const query = normalizeSearchQuery(input.value)
    if (query) {
      preloadPagefind(query).catch(() => {})
    }
    window.clearTimeout(debounce)
    debounce = window.setTimeout(() => {
      render()
    }, 160)
  })
  input.addEventListener("focus", () => {
    loadPagefind().catch(() => {})
  })

  moreButton.addEventListener("click", async () => {
    if (!resultSet || resultSet.total === 0) {
      return
    }
    const currentSequence = sequence.current()
    visibleCount += SEARCH_PAGE_SIZE
    summary.textContent = "Loading."
    try {
      const records = await resultSet.loadThrough(visibleCount)
      if (!sequence.matches(currentSequence)) {
        return
      }
      const previousActive = activeIndex
      paintResults({ records, total: resultSet.total, visibleCount, results, summary, moreButton })
      if (previousActive >= 0) {
        setActiveOption(previousActive)
      }
    } catch (error) {
      if (sequence.matches(currentSequence)) {
        summary.textContent = "Search index is unavailable."
      }
      console.error(error)
    }
  })

  dialog.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.preventDefault()
      closeOverlay()
      return
    }
    if (event.key === "ArrowDown") {
      event.preventDefault()
      moveActiveOption(1)
      return
    }
    if (event.key === "ArrowUp") {
      event.preventDefault()
      if (activeIndex <= 0) {
        clearActiveOption()
        input.focus()
        return
      }
      moveActiveOption(-1)
      return
    }
    if (event.key === "Enter" && document.activeElement === input) {
      event.preventDefault()
      openActiveResult()
    }
  })

  searchOverlay = {
    open: openOverlay,
    warm: () => {
      loadPagefind().catch(() => {})
    }
  }
  return searchOverlay
}

const isEditableTarget = (target) =>
  target instanceof HTMLInputElement
  || target instanceof HTMLTextAreaElement
  || target instanceof HTMLSelectElement
  || target?.isContentEditable

export const initializeSearch = () => {
  const dialog = document.querySelector("[data-search-overlay]")
  if (!(dialog instanceof HTMLDialogElement)) {
    return
  }

  const open = (options = {}) => {
    initializeSearchOverlay()?.open(options)
  }
  const warm = () => {
    initializeSearchOverlay()?.warm()
  }

  document.addEventListener("click", (event) => {
    const control = closestElement(event.target, "[data-search-open]")
    if (!control) {
      return
    }
    event.preventDefault()
    open()
  })

  document.querySelectorAll("[data-search-open]").forEach((control) => {
    control.addEventListener("pointerenter", warm, { once: true })
    control.addEventListener("focus", warm, { once: true })
  })

  document.addEventListener("keydown", (event) => {
    if (dialog.open || isEditableTarget(event.target)) {
      return
    }
    if (event.key === "/" && !event.metaKey && !event.ctrlKey && !event.altKey) {
      event.preventDefault()
      open({ query: "" })
      return
    }
    if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault()
      open({ query: "" })
    }
  })

  if (document.body.hasAttribute("data-search-auto-open") || isSearchRoute()) {
    open({ query: new URLSearchParams(window.location.search).get("q") || "" })
  }
}
