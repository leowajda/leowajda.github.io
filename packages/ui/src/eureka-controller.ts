import { Effect } from "effect"
import { combineCleanups } from "./browser"
import { initializeProblemTable } from "./eureka-problem-table"
import { initializeProblemShells } from "./eureka-problem-shells"

export const initializeEurekaUi = Effect.gen(function* () {
  const cleanups = yield* Effect.all([
    initializeProblemTable,
    initializeProblemShells
  ])

  return combineCleanups(cleanups)
})
