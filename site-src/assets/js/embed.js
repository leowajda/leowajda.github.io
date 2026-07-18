import { initializeCodeCollections } from "./code-collection.js"
import { initializeCopyButtons } from "./copy-buttons.js"
import { onReady } from "./dom.js"
import { initializeEmbedResize, notifyEmbedResize } from "./embed-resize.js"

onReady(() => {
  initializeCopyButtons()
  initializeCodeCollections()
  initializeEmbedResize()

  // Language/approach switches change layout after the click handler runs.
  document.addEventListener(
    "click",
    (event) => {
      if (
        event.target.closest("[data-code-collection-language-control]")
        || event.target.closest("[data-code-collection-variant-control]")
      ) {
        window.setTimeout(notifyEmbedResize, 0)
        window.setTimeout(notifyEmbedResize, 50)
      }
    },
    true
  )
})
