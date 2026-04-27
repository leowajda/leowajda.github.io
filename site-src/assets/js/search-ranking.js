const normalizeText = (value) =>
  value
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9+#]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()

const queryTerms = (query) =>
  normalizeText(query).split(" ").filter(Boolean)

const titleScore = (title, query, terms) => {
  if (!query) {
    return 0
  }

  if (title === query) {
    return 10000
  }

  if (title.startsWith(query)) {
    return 8000
  }

  if (title.includes(query)) {
    return 6000
  }

  if (terms.length > 0 && terms.every((term) => title.includes(term))) {
    return 4000
  }

  if (terms.some((term) => title.includes(term))) {
    return 1200
  }

  return 0
}

const summaryScore = (summary, query, terms) => {
  if (!query) {
    return 0
  }

  if (summary.includes(query)) {
    return 700
  }

  if (terms.length > 0 && terms.every((term) => summary.includes(term))) {
    return 350
  }

  return 0
}

const kindScore = (kind) => {
  switch (kind) {
    case "Problem":
      return 40
    case "Template":
      return 30
    case "Flowchart":
      return 20
    default:
      return 0
  }
}

export const rankedSearchResults = (records, query) => {
  const normalizedQuery = normalizeText(query)
  const terms = queryTerms(query)

  return records
    .map((record, index) => {
      const title = normalizeText(record.meta?.title || record.url || "")
      const summary = normalizeText(record.meta?.summary || "")
      const score = titleScore(title, normalizedQuery, terms)
        + summaryScore(summary, normalizedQuery, terms)
        + kindScore(record.meta?.kind)

      return { index, record, score }
    })
    .sort((left, right) => right.score - left.score || left.index - right.index)
    .map(({ record }) => record)
}
