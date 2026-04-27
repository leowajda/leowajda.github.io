import { rankedSearchResults } from "./search-ranking.js"
import { loadPagefindResultData } from "./pagefind-client.js"

export const SEARCH_PAGE_SIZE = 8

const resultMetaLine = (data) =>
  [data.meta?.kind, data.meta?.section].filter(Boolean).join(": ")

const createResultElement = (data) => {
  const item = document.createElement("article")
  item.className = "search-result"
  item.setAttribute("role", "listitem")

  const meta = document.createElement("p")
  meta.className = "search-result__meta"
  meta.textContent = resultMetaLine(data)

  const title = document.createElement("h2")
  title.className = "search-result__title"
  const link = document.createElement("a")
  link.href = data.url
  link.textContent = data.meta?.title || data.url
  link.dataset.searchResultLink = ""
  title.append(link)

  const summary = document.createElement("p")
  summary.className = "search-result__summary"
  summary.textContent = data.meta?.summary || ""

  item.append(meta, title)
  if (summary.textContent) {
    item.append(summary)
  }

  return item
}

export const createSearchResultSet = (search, query) => ({
  total: search.results.length,
  records: [],
  async loadThrough(count) {
    const results = search.results.slice(0, count)
    this.records = rankedSearchResults(await Promise.all(results.map(loadPagefindResultData)), query)
    return this.records
  }
})

export const renderSearchTooShort = ({ summary, results, moreButton }) => {
  summary.textContent = "Type at least 2 characters."
  results.replaceChildren()
  moreButton.hidden = true
}

export const renderSearchResults = ({ records, total = records.length, visibleCount, results, summary, moreButton }) => {

  if (total === 0) {
    summary.textContent = "No results."
    results.replaceChildren()
    moreButton.hidden = true
    return
  }

  summary.textContent = total === 1 ? "1 result." : `${total} results.`

  const visibleRecords = records.slice(0, visibleCount)
  results.replaceChildren(...visibleRecords.map(createResultElement))

  moreButton.hidden = visibleCount >= total
  moreButton.textContent = `Show ${Math.min(SEARCH_PAGE_SIZE, total - visibleCount)} more`
}
