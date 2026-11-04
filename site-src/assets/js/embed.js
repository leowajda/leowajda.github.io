import { initializeCodeCollections } from "./code-collection.js"
import { initializeCopyButtons } from "./copy-buttons.js"
import { onReady } from "./dom.js"

onReady(() => {
  initializeCopyButtons()
  initializeCodeCollections()
})
