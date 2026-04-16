export const createProblemTableState = (language) => ({
  search: "",
  difficulty: "",
  categories: new Set(),
  language
})

const toggleSingleSelect = (currentValue, nextValue) =>
  currentValue === nextValue ? "" : nextValue

const toggleCategory = (categories, value) => {
  if (value === "") {
    return new Set()
  }

  const nextCategories = new Set(categories)
  if (nextCategories.has(value)) {
    nextCategories.delete(value)
    return nextCategories
  }

  nextCategories.add(value)
  return nextCategories
}

export const reduceProblemTableState = (state, action) => {
  switch (action.type) {
    case "search":
      return {
        ...state,
        search: action.value.trim().toLowerCase()
      }
    case "difficulty":
      return {
        ...state,
        difficulty: toggleSingleSelect(state.difficulty, action.value)
      }
    case "language":
      return {
        ...state,
        language: toggleSingleSelect(state.language, action.value)
      }
    case "category":
      return {
        ...state,
        categories: toggleCategory(state.categories, action.value)
      }
    case "clear":
      return createProblemTableState(action.defaultLanguage)
  }
}

export const matchesProblemRow = (state, row) =>
  (!state.search || row.searchTitle.includes(state.search))
  && (!state.difficulty || row.difficulty === state.difficulty)
  && (!state.language || row.languages.includes(state.language))
  && (state.categories.size === 0 || row.categories.some((category) => state.categories.has(category)))

export const isSingleSelectButtonActive = (state, kind, value) =>
  state[kind] === value || (!state[kind] && value === "")

export const isCategoryButtonActive = (state, value) =>
  value === "" ? state.categories.size === 0 : state.categories.has(value)
