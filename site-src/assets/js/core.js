import { initializeCodeCollections } from "./code-collection.js"
import { initializeCopyButtons } from "./copy-buttons.js"
import { initializeBackButton } from "./navigation.js"
import { onReady } from "./dom.js"
import { initializeSourceTree } from "./source-tree.js"
import { initializeSearchOverlay } from "./site-search.js"
import { initializeThemeToggle } from "./theme.js"

onReady(() => {
  initializeThemeToggle()
  initializeBackButton()
  initializeCopyButtons()
  initializeCodeCollections()
  initializeSourceTree()
  initializeSearchOverlay()
})
