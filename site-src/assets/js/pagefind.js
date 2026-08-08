let pagefindPromise
const resultDataCache = new Map()

export const MIN_SEARCH_QUERY_LENGTH = 2

export const normalizeSearchQuery = (value) => (value || "").trim()

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

export const loadPagefind = async () => {
  if (!pagefindPromise) {
    pagefindPromise = (async () => {
      const bundle = document.body.dataset.pagefindBundle || "/pagefind/pagefind.js"
      const baseUrl = document.body.dataset.pagefindBaseUrl || "/"
      const pagefind = await import(bundle)
      await pagefind.options({
        baseUrl,
        excerptLength: 22,
        ranking: {
          metaWeights: {
            title: 7,
            kind: 2,
            project: 2,
            summary: 2,
            target: 2
          },
          pageLength: 0.45,
          termFrequency: 0.9
        }
      })
      await pagefind.init()
      return pagefind
    })()
  }
  return pagefindPromise
}

export const preloadPagefind = async (query, options = {}) => {
  const pagefind = await loadPagefind()
  await pagefind.preload(query, options)
  return pagefind
}

export const searchPagefind = async (query, options = {}) => {
  const pagefind = query === null ? await loadPagefind() : await preloadPagefind(query, options)
  return pagefind.search(query, options)
}

export const loadPagefindResultData = (result) => {
  const key = result.id || result.url
  if (!key) {
    return result.data()
  }
  if (!resultDataCache.has(key)) {
    resultDataCache.set(key, result.data())
  }
  return resultDataCache.get(key)
}

export const loadPagefindRecords = async (query, { limit, ...options } = {}) => {
  const search = await searchPagefind(query, options)
  const results = typeof limit === "number" ? search.results.slice(0, limit) : search.results
  return Promise.all(results.map(loadPagefindResultData))
}

export const pagefindFilter = (filters) =>
  Object.fromEntries(
    Object.entries(filters)
      .map(([key, value]) => [key, Array(value).filter(Boolean)])
      .filter(([, value]) => value.length > 0)
      .map(([key, value]) => [key, value.length === 1 ? value[0] : value])
  )
