import { expect, test } from "@playwright/test"

test("flowchart nodes expose template guide targets", async ({ page }) => {
  await page.goto("/writing/algorithmic-flowchart/#directed-graph-topo")

  await expect(page.getByRole("heading", { name: "Algorithmic Flowchart" })).toBeVisible()
  await expect(page.getByRole("button", { name: "Solution node: Topological Sort" })).toHaveAttribute("aria-pressed", "true")
  await expect(page.getByRole("heading", { name: "Topological Sort", level: 2 })).toBeVisible()
  await page.getByRole("button", { name: "Template Guide" }).click()
  await expect(page.getByRole("link", { name: "Graph Topological sort" })).toHaveAttribute(
    "href",
    /\/writing\/algorithmic-templates\/#graph\/topological-sort$/
  )
})

test("generic dynamic programming nodes link to the broad template group", async ({ page }) => {
  await page.goto("/writing/algorithmic-flowchart/#counting-dp")

  await expect(page.getByRole("heading", { name: "Dynamic Programming", level: 2 })).toBeVisible()
  await page.getByRole("button", { name: "Template Guide" }).click()

  const guideLink = page.getByRole("link", { name: "Dynamic Programming" })
  await expect(guideLink).toHaveAttribute("href", /\/writing\/algorithmic-templates\/#dynamic-programming$/)
  await expect(page.getByRole("link", { name: /Dynamic Programming 1D/ })).toHaveCount(0)
})

test("solution nodes appear in the decision path", async ({ page }) => {
  await page.goto("/writing/algorithmic-flowchart/#shortest-path-dijkstra")

  await page.getByRole("button", { name: "Decision Path" }).click()

  const path = page.locator("[data-flowchart-panel='path']")
  await expect(path.getByRole("button", { name: "Is the graph weighted?" })).toBeVisible()
  await expect(path.getByRole("button", { name: "Dijkstra's Algorithm" })).toBeVisible()
})

test("decision inspector title matches the selected node question", async ({ page }) => {
  await page.goto("/writing/algorithmic-flowchart/#kth-smallest")

  await expect(page.getByRole("heading", { name: "Need the kth smallest or largest?", level: 2 })).toBeVisible()
})

test("legacy flowchart hashes resolve through node aliases", async ({ page }) => {
  await page.goto("/writing/algorithmic-flowchart/#max/min-dp")

  await expect(page.locator('[data-flowchart-node-id="maximum-minimum-dp"]')).toHaveAttribute(
    "aria-pressed",
    "true"
  )
  await expect(page.getByRole("heading", { name: "Dynamic Programming", level: 2 })).toBeVisible()
})
