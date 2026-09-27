import { onReady } from "./dom.js"

const storageKey = (id) => `leowajda.github.io-source-tree:${id}`

const writeState = (id, state) => {
  try {
    window.sessionStorage.setItem(storageKey(id), JSON.stringify(state))
  } catch {
    // Ignore storage failures and keep the current open folders for this page.
  }
}

const initializeSourceTree = (root) => {
  const groups = [...root.querySelectorAll("details[data-tree-path]")]
  if (groups.length === 0) {
    return
  }

  const id = root.dataset.sourceTree || "tree"
  let applying = false

  const persist = () => {
    writeState(id, Object.fromEntries(groups.map((group) => [group.dataset.treePath, group.open])))
  }

  const setAll = (open) => {
    applying = true
    root.classList.add("source-tree--pending")
    groups.forEach((group) => {
      group.open = open
    })
    root.classList.remove("source-tree--pending")
    applying = false
    persist()
  }

  root.addEventListener("toggle", (event) => {
    if (applying || !(event.target instanceof HTMLDetailsElement)) {
      return
    }
    persist()
  }, true)

  root.querySelector("[data-source-tree-expand]")?.addEventListener("click", () => {
    setAll(true)
  })
  root.querySelector("[data-source-tree-collapse]")?.addEventListener("click", () => {
    setAll(false)
  })

  const searchInput = root.querySelector("[data-source-tree-search]")
  const status = root.querySelector("[data-source-tree-status]")
  const items = [...root.querySelectorAll(".source-tree__item")]

  const clearSearchOpens = () => {
    groups.forEach((group) => {
      if (group.dataset.searchOpened !== "true") {
        return
      }
      group.open = false
      delete group.dataset.searchOpened
    })
  }

  const openForSearch = (group) => {
    if (group.open) {
      return
    }
    group.dataset.searchOpened = "true"
    group.open = true
  }

  const reveal = (item) => {
    item.hidden = false
    const details = item.querySelector(":scope > details")
    if (!details) {
      return
    }
    openForSearch(details)
    details.querySelectorAll(":scope > ul > .source-tree__item").forEach(reveal)
  }

  const matchItem = (item, needle) => {
    const details = item.querySelector(":scope > details")
    const link = item.querySelector(":scope > a")
    if (link) {
      const match = link.textContent.toLowerCase().includes(needle)
      item.hidden = !match
      return match
    }
    if (!details) {
      item.hidden = true
      return false
    }
    const summary = details.querySelector(":scope > summary")
    const own = summary.textContent.toLowerCase().includes(needle)
    const children = [...details.querySelectorAll(":scope > ul > .source-tree__item")]
    if (own) {
      item.hidden = false
      children.forEach(reveal)
      openForSearch(details)
      return true
    }
    const childMatch = children.reduce((matched, child) => matchItem(child, needle) || matched, false)
    item.hidden = !childMatch
    if (childMatch) {
      openForSearch(details)
    }
    return childMatch
  }

  const filterTree = () => {
    const needle = searchInput.value.trim().toLowerCase()
    applying = true
    clearSearchOpens()
    items.forEach((item) => {
      item.hidden = false
    })
    if (!needle) {
      applying = false
      status.hidden = true
      status.textContent = ""
      return
    }
    const tops = [...root.querySelectorAll("nav > .source-tree__list > .source-tree__item")]
    tops.forEach((item) => matchItem(item, needle))
    const visible = [...root.querySelectorAll(".source-tree__item > a")].filter((link) => !link.parentElement.hidden)
    applying = false
    status.hidden = visible.length > 0
    status.textContent = visible.length > 0 ? "" : "No files match."
  }

  searchInput?.addEventListener("input", filterTree)
}

const keepView = () => {
  if (window.location.hash) {
    return
  }
  window.scrollTo(0, 0)
}

onReady(() => {
  keepView()
  document.querySelectorAll("[data-source-tree]").forEach(initializeSourceTree)
})

window.addEventListener("pageshow", keepView)
