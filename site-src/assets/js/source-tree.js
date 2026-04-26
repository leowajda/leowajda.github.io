export const initializeSourceTree = () => {
  for (const activeLink of document.querySelectorAll(".source-tree__link[aria-current='page']")) {
    let current = activeLink.parentElement

    while (current) {
      if (current.tagName === "DETAILS") {
        current.open = true
      }

      current = current.parentElement
    }
  }
}
