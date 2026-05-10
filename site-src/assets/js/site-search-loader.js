const SEARCH_ROUTE = /\/search\/?$/

let overlayModulePromise = null

const isSearchRoute = () => SEARCH_ROUTE.test(window.location.pathname)

const isEditableTarget = (target) =>
  target instanceof HTMLInputElement
  || target instanceof HTMLTextAreaElement
  || target instanceof HTMLSelectElement
  || target?.isContentEditable

const closestElement = (target, selector) =>
  target instanceof Element ? target.closest(selector) : null

const queryFromUrl = () => new URLSearchParams(window.location.search).get("q") || ""

const loadOverlayModule = () => {
  overlayModulePromise ||= import("./site-search.js")
  return overlayModulePromise
}

const openOverlay = async (options = {}) => {
  const { openSearchOverlay } = await loadOverlayModule()
  openSearchOverlay(options)
}

const warmOverlay = () => {
  loadOverlayModule()
    .then(({ warmSearchOverlay }) => warmSearchOverlay())
    .catch(() => {})
}

export const initializeSearchLoader = () => {
  const dialog = document.querySelector("[data-search-overlay]")
  if (!(dialog instanceof HTMLDialogElement)) {
    return
  }

  document.addEventListener("click", (event) => {
    const control = closestElement(event.target, "[data-search-open]")
    if (!control) {
      return
    }

    event.preventDefault()
    openOverlay()
      .catch((error) => {
        console.error(error)
      })
  })

  document.querySelectorAll("[data-search-open]").forEach((control) => {
    control.addEventListener("pointerenter", warmOverlay, { once: true })
    control.addEventListener("focus", warmOverlay, { once: true })
  })

  document.addEventListener("keydown", (event) => {
    if (dialog.open || isEditableTarget(event.target)) {
      return
    }

    if (event.key === "/" && !event.metaKey && !event.ctrlKey && !event.altKey) {
      event.preventDefault()
      openOverlay({ query: "" })
        .catch((error) => {
          console.error(error)
        })
      return
    }

    if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault()
      openOverlay({ query: "" })
        .catch((error) => {
          console.error(error)
        })
    }
  })

  if (document.body.hasAttribute("data-search-auto-open") || isSearchRoute()) {
    openOverlay({ query: queryFromUrl() })
      .catch((error) => {
        console.error(error)
      })
  }
}
