let pagefindPromise
const resultDataCache = new Map()

const pagefindConfig = () => ({
  bundle: document.body.dataset.pagefindBundle || "/pagefind/pagefind.js",
  baseUrl: document.body.dataset.pagefindBaseUrl || "/"
})

const debugPagefind = () => {
  try {
    return window.localStorage.getItem("pagefind:debug") === "1"
  } catch {
    return false
  }
}

const timed = async (label, operation) => {
  if (!debugPagefind()) {
    return operation()
  }

  const start = window.performance.now()
  try {
    return await operation()
  } finally {
    const elapsed = Math.round(window.performance.now() - start)
    console.debug(`[Pagefind] ${label}: ${elapsed}ms`)
  }
}

export const loadPagefind = async () => {
  if (!pagefindPromise) {
    pagefindPromise = timed("init", async () => {
      const { bundle, baseUrl } = pagefindConfig()
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
    })
  }

  return pagefindPromise
}

export const preloadPagefind = async (query, options = {}) => {
  const pagefind = await loadPagefind()
  await timed(`preload "${query}"`, () => pagefind.preload(query, options))
  return pagefind
}

export const searchPagefind = async (query, options = {}) => {
  const pagefind = query === null ? await loadPagefind() : await preloadPagefind(query, options)
  const label = query === null ? "filters" : `"${query}"`
  return timed(`search ${label}`, () => pagefind.search(query, options))
}

export const loadPagefindResultData = (result) => {
  const key = result.id || result.url
  if (!key) {
    return timed("result data", () => result.data())
  }

  if (!resultDataCache.has(key)) {
    resultDataCache.set(key, timed(`result data ${key}`, () => result.data()))
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
