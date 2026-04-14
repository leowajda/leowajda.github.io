import assert from "node:assert/strict"
import test from "node:test"
import {
  createProblemTableState,
  isCategoryButtonActive,
  isSingleSelectButtonActive,
  matchesProblemRow,
  reduceProblemTableState,
  type ProblemRowModel
} from "../../packages/ui/src/eureka-problem-table-state.js"

const row: ProblemRowModel = {
  element: {} as HTMLElement,
  searchTitle: "two sum",
  difficulty: "easy",
  languages: ["java", "python"],
  categories: ["Array", "Hash Table"]
}

test("reduceProblemTableState applies search, toggles filters, and clears back to defaults", () => {
  let state = createProblemTableState("java")
  state = reduceProblemTableState(state, { type: "search", value: " Two " })
  state = reduceProblemTableState(state, { type: "difficulty", value: "easy" })
  state = reduceProblemTableState(state, { type: "category", value: "Array" })
  state = reduceProblemTableState(state, { type: "language", value: "python" })

  assert.equal(state.search, "two")
  assert.equal(state.difficulty, "easy")
  assert.equal(state.categories.has("Array"), true)
  assert.equal(state.language, "python")

  state = reduceProblemTableState(state, { type: "clear", defaultLanguage: "java" })
  assert.equal(state.search, "")
  assert.equal(state.difficulty, "")
  assert.equal(state.language, "java")
  assert.equal(state.categories.size, 0)
})

test("matchesProblemRow and button active helpers reflect the derived state", () => {
  const state = reduceProblemTableState(
    reduceProblemTableState(
      reduceProblemTableState(createProblemTableState("java"), { type: "difficulty", value: "easy" }),
      { type: "category", value: "Array" }
    ),
    { type: "search", value: "Two" }
  )

  assert.equal(matchesProblemRow(state, row), true)
  assert.equal(isSingleSelectButtonActive(state, "difficulty", "easy"), true)
  assert.equal(isSingleSelectButtonActive(state, "language", "java"), true)
  assert.equal(isCategoryButtonActive(state, "Array"), true)
  assert.equal(matchesProblemRow(state, { ...row, difficulty: "hard" }), false)
})
