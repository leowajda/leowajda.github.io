import { expect, test } from "@playwright/test"
import { expectCentered, expectScaleNear, FOCUS_SCALE } from "./helpers/flowchart.js"

test("solution nodes appear in the decision path", async ({ page }) => {
  await page.goto("/writing/algorithmic-flowchart/#shortest-path-dijkstra")

  await page.getByRole("button", { name: "Decision Path" }).click()

  const path = page.locator("[data-flowchart-panel='path']")
  await expect(path.getByRole("button", { name: "Is the graph weighted?" })).toBeVisible()
  await expect(path.getByRole("button", { name: "Dijkstra's Algorithm" })).toBeVisible()
})

test("decision path shows root children as next choices", async ({ page }) => {
  await page.goto("/writing/algorithmic-flowchart/#graph")

  await page.getByRole("button", { name: "Decision Path" }).click()

  const path = page.locator("[data-flowchart-panel='path']")
  await expect(path.getByText("Next")).toBeVisible()
  await expect(path.getByRole("button", { name: "Yes: Is it a tree?" })).toBeVisible()
  await expect(path.getByRole("button", { name: "No: Need the kth smallest or largest?" })).toBeVisible()
})

test("decision path shows children for deeper decision nodes", async ({ page }) => {
  await page.goto("/writing/algorithmic-flowchart/#directed-graph")

  await page.getByRole("button", { name: "Decision Path" }).click()

  const path = page.locator("[data-flowchart-panel='path']")
  await expect(path.getByRole("button", { name: "Yes: Topological Sort" })).toBeVisible()
  await expect(path.getByRole("button", { name: "No: Is the problem related to shortest paths?" })).toBeVisible()
})

test("decision path choices move forward through the flowchart", async ({ page }) => {
  await page.goto("/writing/algorithmic-flowchart/#sums")

  await page.getByRole("button", { name: "Decision Path" }).click()

  const path = page.locator("[data-flowchart-panel='path']")
  await expect(path.getByRole("button", { name: "Yes: Prefix Sums" })).toBeVisible()
  await path.getByRole("button", { name: "No: About subarrays or substrings?" }).click()

  const subarraysNode = page.getByRole("button", { name: "Decision node: About subarrays or substrings?" })
  await expect(subarraysNode).toHaveAttribute("aria-pressed", "true")
  await expect(page.getByRole("heading", { name: "About subarrays or substrings?", level: 2 })).toBeVisible()
  await expect(path.getByRole("button", { name: "No: Calculating a maximum or minimum?" })).toBeVisible()
  await expectScaleNear(page, FOCUS_SCALE)
  await expectCentered(page, subarraysNode)
})
