import { initializeCodeCollections } from "./code-collection.js"
import { initializeCopyButtons } from "./copy-buttons.js"
import { onReady } from "./dom.js"
import { initializeEmbedResize } from "./embed-resize.js"

onReady(() => {
  initializeCopyButtons()
  initializeCodeCollections()
  initializeEmbedResize()
})
