export const MIN_SEARCH_QUERY_LENGTH = 2

export const normalizeSearchQuery = (value) =>
  (value || "").trim()

export const meaningfulSearchQuery = (value) =>
  normalizeSearchQuery(value).length >= MIN_SEARCH_QUERY_LENGTH

export const normalizedPath = (url) => {
  try {
    return new URL(url, window.location.origin).pathname
  } catch {
    return url
  }
}

export const createSequenceGuard = () => {
  let current = 0

  return {
    next() {
      current += 1
      return current
    },
    current() {
      return current
    },
    matches(sequence) {
      return sequence === current
    }
  }
}
