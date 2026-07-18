export const onReady = (callback) => {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback, { once: true })
    return
  }

  callback()
}

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
