export const initializeEurekaUi = () => {
  initializeProblemTable()
  initializeProblemShells()
}

const initializeProblemTable = () => {
  const table = document.getElementById("problem-table")
  if (!table) {
    return
  }

  const searchInput = document.querySelector<HTMLInputElement>("[data-search-input]")
  const filterButtons = Array.from(document.querySelectorAll<HTMLButtonElement>("[data-filter-kind]"))
  const summary = {
    visible: document.querySelector<HTMLElement>("[data-visible-count]"),
    total: document.querySelector<HTMLElement>("[data-total-count]")
  }

  const rows = Array.from(table.querySelectorAll<HTMLElement>("[data-problem-row]"))
  const state = {
    search: "",
    difficulty: "",
    categories: new Set<string>(),
    language: table.dataset.languageFilter || ""
  }

  const syncSingleSelectButtons = (kind: string, activeValue: string) => {
    filterButtons.forEach((button) => {
      if (button.dataset.filterKind !== kind) {
        return
      }

      const value = button.dataset.filterValue || ""
      button.classList.toggle("is-active", value === activeValue || (!activeValue && value === ""))
    })
  }

  const syncCategoryButtons = () => {
    filterButtons.forEach((button) => {
      if (button.dataset.filterKind !== "category") {
        return
      }

      const value = button.dataset.filterValue || ""
      const isActive = value === "" ? state.categories.size === 0 : state.categories.has(value)
      button.classList.toggle("is-active", isActive)
    })
  }

  const activateDefaults = () => {
    filterButtons.forEach((button) => {
      const kind = button.dataset.filterKind
      const value = button.dataset.filterValue || ""

      if (kind === "difficulty" && value === "") {
        button.classList.add("is-active")
      }

      if (kind === "language" && value === state.language) {
        button.classList.add("is-active")
      }

      if (kind === "category" && value === "") {
        button.classList.add("is-active")
      }
    })
  }

  const render = () => {
    let visibleCount = 0

    rows.forEach((row) => {
      const matchesSearch = !state.search || row.dataset.searchName?.includes(state.search)
      const matchesDifficulty = !state.difficulty || row.dataset.difficulty === state.difficulty
      const matchesLanguage = !state.language || row.dataset.languages?.split("|").includes(state.language)
      const categories = row.dataset.categories ? row.dataset.categories.split("|") : []
      const matchesCategory = state.categories.size === 0 || categories.some((category) => state.categories.has(category))
      const matches = Boolean(matchesSearch && matchesDifficulty && matchesLanguage && matchesCategory)

      row.hidden = !matches
      if (matches) {
        visibleCount += 1
      }
    })

    if (summary.visible) {
      summary.visible.textContent = String(visibleCount)
    }

    if (summary.total) {
      summary.total.textContent = String(rows.length)
    }
  }

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      state.search = searchInput.value.trim().toLowerCase()
      render()
    })
  }

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const kind = button.dataset.filterKind
      const value = button.dataset.filterValue || ""

      if (kind === "clear") {
        state.search = ""
        state.difficulty = ""
        state.categories = new Set<string>()
        state.language = table.dataset.languageFilter || ""

        if (searchInput) {
          searchInput.value = ""
        }

        filterButtons.forEach((item) => item.classList.remove("is-active"))
        activateDefaults()
        render()
        return
      }

      if (kind === "category") {
        if (value === "") {
          state.categories = new Set<string>()
        } else if (state.categories.has(value)) {
          state.categories.delete(value)
        } else {
          state.categories.add(value)
        }

        syncCategoryButtons()
      } else if (kind === "difficulty" || kind === "language") {
        state[kind] = state[kind] === value ? "" : value
        syncSingleSelectButtons(kind, state[kind])
      }

      render()
    })
  })

  activateDefaults()
  render()
}

const getDefaultImplementation = (languagePanels: Array<HTMLElement>, language: string) => {
  const panel = languagePanels.find((item) => item.dataset.language === language)
  if (!panel) {
    return ""
  }

  const firstImplementation = panel.querySelector<HTMLElement>("[data-implementation-panel]")
  return firstImplementation ? firstImplementation.id : ""
}

const initializeProblemShells = () => {
  document.querySelectorAll<HTMLElement>("[data-problem-shell]").forEach((shell) => {
    const languageButtons = Array.from(shell.querySelectorAll<HTMLButtonElement>("[data-language-target]"))
    const languagePanels = Array.from(shell.querySelectorAll<HTMLElement>("[data-language-panel]"))

    if (!languageButtons.length || !languagePanels.length) {
      return
    }

    const implementationMap = new Map<string, { language: string; implementationId: string }>()
    languagePanels.forEach((panel) => {
      panel.querySelectorAll<HTMLElement>("[data-implementation-panel]").forEach((implementationPanel) => {
        implementationMap.set(implementationPanel.id, {
          language: panel.dataset.language || "",
          implementationId: implementationPanel.id
        })
      })
    })

    const params = new URLSearchParams(window.location.search)
    const requestedImplementation = params.get("implementation") || ""
    const requestedLanguage = params.get("language") || ""
    const initial = implementationMap.get(requestedImplementation)
    const initialLanguage = initial?.language
      || (requestedLanguage && languagePanels.some((panel) => panel.dataset.language === requestedLanguage)
        ? requestedLanguage
        : (languagePanels[0].dataset.language || ""))
    const initialImplementation = initial?.implementationId || getDefaultImplementation(languagePanels, initialLanguage)

    const activateImplementation = (panel: HTMLElement, implementationId: string) => {
      const implementationButtons = Array.from(panel.querySelectorAll<HTMLButtonElement>("[data-implementation-target]"))
      const implementationPanels = Array.from(panel.querySelectorAll<HTMLElement>("[data-implementation-panel]"))
      const implementationActions = Array.from(panel.querySelectorAll<HTMLElement>("[data-implementation-actions]"))
      const nextImplementationId = implementationButtons.some((button) => button.dataset.implementationTarget === implementationId)
        ? implementationId
        : getDefaultImplementation(languagePanels, panel.dataset.language || "")

      implementationButtons.forEach((button) => {
        const isActive = button.dataset.implementationTarget === nextImplementationId
        button.classList.toggle("is-active", isActive)
        button.setAttribute("aria-pressed", String(isActive))
      })

      implementationPanels.forEach((implementationPanel) => {
        implementationPanel.hidden = implementationPanel.id !== nextImplementationId
      })

      implementationActions.forEach((actions) => {
        actions.hidden = actions.dataset.implementationActions !== nextImplementationId
      })
    }

    const activateLanguage = (language: string, implementationId: string, updateUrl: boolean) => {
      languageButtons.forEach((button) => {
        const isActive = button.dataset.languageTarget === language
        button.classList.toggle("is-active", isActive)
        button.setAttribute("aria-pressed", String(isActive))
      })

      languagePanels.forEach((panel) => {
        panel.hidden = panel.dataset.language !== language
      })

      const activePanel = languagePanels.find((panel) => panel.dataset.language === language)
      if (!activePanel) {
        return
      }

      activateImplementation(activePanel, implementationId || getDefaultImplementation(languagePanels, language))

      if (updateUrl && implementationId) {
        const url = new URL(window.location.href)
        url.searchParams.set("language", language)
        url.searchParams.set("implementation", implementationId)
        window.history.replaceState(null, "", `${url.pathname}?${url.searchParams.toString()}${url.hash}`)
      }
    }

    activateLanguage(initialLanguage, initialImplementation, false)

    languageButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const targetLanguage = button.dataset.languageTarget || ""
        activateLanguage(targetLanguage, getDefaultImplementation(languagePanels, targetLanguage), true)
      })
    })

    languagePanels.forEach((panel) => {
      panel.querySelectorAll<HTMLButtonElement>("[data-implementation-target]").forEach((button) => {
        button.addEventListener("click", () => {
          activateLanguage(panel.dataset.language || "", button.dataset.implementationTarget || "", true)
        })
      })
    })
  })
}
