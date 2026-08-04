export const onReady = (callback) => {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback, { once: true })
    return
  }

  callback()
}

export const closestElement = (target, selector) =>
  target instanceof Element ? target.closest(selector) : null

export const onHashChange = (callback) => {
  window.addEventListener("hashchange", callback)
  return () => window.removeEventListener("hashchange", callback)
}

export const getHashValue = () => {
  const hash = window.location.hash.replace(/^#/, "")

  try {
    return hash ? decodeURIComponent(hash) : ""
  } catch {
    return hash
  }
}

export const replaceHashValue = (value) => {
  const nextUrl = new URL(window.location.href)
  nextUrl.hash = value ? encodeURIComponent(value) : ""
  window.history.replaceState({}, "", nextUrl)
}

export const SEARCH_ROUTE = "/search/"

export const isSearchRoute = (pathname = window.location.pathname) =>
  pathname === SEARCH_ROUTE || pathname === SEARCH_ROUTE.slice(0, -1)
