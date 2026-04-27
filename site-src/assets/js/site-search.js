import { loadPagefind, preloadPagefind, searchPagefind } from "./pagefind-client.js"
import { createSearchResultSet, renderSearchResults, renderSearchTooShort, SEARCH_PAGE_SIZE } from "./search-results.js"
import { createSequenceGuard, meaningfulSearchQuery, normalizeSearchQuery } from "./search-query.js"

const SEARCH_ROUTE = /\/search\/?$/

const isSearchRoute = () => SEARCH_ROUTE.test(window.location.pathname)

const isEditableTarget = (target) =>
  target instanceof HTMLInputElement
  || target instanceof HTMLTextAreaElement
  || target instanceof HTMLSelectElement
  || target?.isContentEditable

const queryFromUrl = () => new URLSearchParams(window.location.search).get("q") || ""

const warmSearchIndex = () => {
  loadPagefind().catch(() => {})
}

const warmSearchIndexOnIdle = () => {
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(warmSearchIndex, { timeout: 3000 })
    return
  }

  window.setTimeout(warmSearchIndex, 1200)
}

const renderPrompt = ({ summary, results, moreButton }) => {
  summary.textContent = "Type to search."
  results.replaceChildren()
  moreButton.hidden = true
}

const renderUnavailable = ({ summary, results, moreButton }) => {
  summary.textContent = "Search index is unavailable."
  results.replaceChildren()
  moreButton.hidden = true
}

export const initializeSearchOverlay = () => {
  const dialog = document.querySelector("[data-search-overlay]")
  const input = dialog?.querySelector("[data-search-input]")
  const summary = dialog?.querySelector("[data-search-summary]")
  const results = dialog?.querySelector("[data-search-results]")
  const moreButton = dialog?.querySelector("[data-search-more]")

  if (!(dialog instanceof HTMLDialogElement) || !input || !summary || !results || !moreButton) {
    return
  }

  let opener = null
  let resultSet = null
  let visibleCount = SEARCH_PAGE_SIZE
  const sequence = createSequenceGuard()
  let debounce

  const resultLinks = () =>
    Array.from(results.querySelectorAll("[data-search-result-link]"))

  const focusResult = (offset) => {
    const links = resultLinks()
    if (links.length === 0) {
      return
    }

    const currentIndex = links.indexOf(document.activeElement)
    const nextIndex = currentIndex === -1 ? 0 : Math.max(0, Math.min(currentIndex + offset, links.length - 1))
    links[nextIndex].focus()
  }

  const focusPreviousResult = () => {
    const links = resultLinks()
    const currentIndex = links.indexOf(document.activeElement)

    if (currentIndex <= 0) {
      input.focus()
      return
    }

    links[currentIndex - 1].focus()
  }

  const openFocusedResult = () => {
    const [firstResult] = resultLinks()
    if (firstResult) {
      window.location.assign(firstResult.href)
    }
  }

  const clearQuery = () => {
    input.value = ""
    resultSet = null
    renderPrompt({ summary, results, moreButton })
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

    if (!query) {
      resultSet = null
      renderPrompt({ summary, results, moreButton })
      return
    }

    if (!meaningfulSearchQuery(query)) {
      resultSet = null
      renderSearchTooShort({ summary, results, moreButton })
      return
    }

    summary.textContent = "Searching."

    try {
      const search = await searchPagefind(query)
      if (!sequence.matches(currentSequence)) {
        return
      }

      const nextResultSet = createSearchResultSet(search, query)
      const records = await nextResultSet.loadThrough(visibleCount)
      if (!sequence.matches(currentSequence)) {
        return
      }

      resultSet = nextResultSet
      renderSearchResults({ records, total: resultSet.total, visibleCount, results, summary, moreButton })
    } catch (error) {
      renderUnavailable({ summary, results, moreButton })
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

    warmSearchIndex()
    window.setTimeout(() => input.focus(), 0)
    render()
  }

  document.querySelectorAll("[data-search-open]").forEach((control) => {
    control.addEventListener("click", (event) => {
      event.preventDefault()
      openOverlay()
    })
    control.addEventListener("pointerenter", warmSearchIndex, { once: true })
    control.addEventListener("focus", warmSearchIndex, { once: true })
  })

  dialog.querySelector("[data-search-close]")?.addEventListener("click", closeOverlay)

  dialog.addEventListener("cancel", (event) => {
    event.preventDefault()

    if (normalizeSearchQuery(input.value)) {
      clearQuery()
      return
    }

    closeOverlay()
  })

  dialog.addEventListener("close", () => {
    if (opener instanceof HTMLElement && document.contains(opener)) {
      opener.focus()
    }
  })

  input.addEventListener("input", () => {
    const query = normalizeSearchQuery(input.value)
    if (query) {
      preloadPagefind(query)
        .catch(() => {})
    }
    window.clearTimeout(debounce)
    debounce = window.setTimeout(() => {
      render()
    }, 160)
  })
  input.addEventListener("focus", warmSearchIndex)

  moreButton.addEventListener("click", async () => {
    if (!resultSet || resultSet.total === 0) {
      return
    }

    const currentSequence = sequence.current()
    visibleCount += SEARCH_PAGE_SIZE
    summary.textContent = "Loading."
    const records = await resultSet.loadThrough(visibleCount)
    if (!sequence.matches(currentSequence)) {
      return
    }

    renderSearchResults({ records, total: resultSet.total, visibleCount, results, summary, moreButton })
  })

  dialog.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault()
      focusResult(1)
      return
    }

    if (event.key === "ArrowUp") {
      event.preventDefault()
      focusPreviousResult()
      return
    }

    if (event.key === "Enter" && document.activeElement === input) {
      event.preventDefault()
      openFocusedResult()
    }
  })

  document.addEventListener("keydown", (event) => {
    if (dialog.open || isEditableTarget(event.target)) {
      return
    }

    if (event.key === "/" && !event.metaKey && !event.ctrlKey && !event.altKey) {
      event.preventDefault()
      openOverlay({ query: "" })
      return
    }

    if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault()
      openOverlay({ query: "" })
    }
  })

  if (document.body.hasAttribute("data-search-auto-open")) {
    openOverlay({ query: queryFromUrl() })
  }

  warmSearchIndexOnIdle()
}
