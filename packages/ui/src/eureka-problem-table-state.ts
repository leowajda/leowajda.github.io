export type ProblemRowModel = {
  readonly searchTitle: string
  readonly difficulty: string
  readonly categories: ReadonlyArray<string>
  readonly languages: ReadonlyArray<string>
  readonly element: HTMLElement
}

export type ProblemTableState = {
  readonly search: string
  readonly difficulty: string
  readonly categories: ReadonlySet<string>
  readonly language: string
}

export type ProblemTableAction =
  | { readonly type: "search"; readonly value: string }
  | { readonly type: "difficulty"; readonly value: string }
  | { readonly type: "language"; readonly value: string }
  | { readonly type: "category"; readonly value: string }
  | { readonly type: "clear"; readonly defaultLanguage: string }

export const createProblemTableState = (language: string): ProblemTableState => ({
  search: "",
  difficulty: "",
  categories: new Set<string>(),
  language
})

const toggleSingleSelect = (currentValue: string, nextValue: string) =>
  currentValue === nextValue ? "" : nextValue

const toggleCategory = (categories: ReadonlySet<string>, value: string): ReadonlySet<string> => {
  if (value === "") {
    return new Set<string>()
  }

  const nextCategories = new Set(categories)
  if (nextCategories.has(value)) {
    nextCategories.delete(value)
    return nextCategories
  }

  nextCategories.add(value)
  return nextCategories
}

export const reduceProblemTableState = (
  state: ProblemTableState,
  action: ProblemTableAction
): ProblemTableState => {
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

export const matchesProblemRow = (state: ProblemTableState, row: ProblemRowModel) =>
  (!state.search || row.searchTitle.includes(state.search))
  && (!state.difficulty || row.difficulty === state.difficulty)
  && (!state.language || row.languages.includes(state.language))
  && (state.categories.size === 0 || row.categories.some((category) => state.categories.has(category)))

export const isSingleSelectButtonActive = (
  state: ProblemTableState,
  kind: "difficulty" | "language",
  value: string
) =>
  state[kind] === value || (!state[kind] && value === "")

export const isCategoryButtonActive = (state: ProblemTableState, value: string) =>
  value === "" ? state.categories.size === 0 : state.categories.has(value)
