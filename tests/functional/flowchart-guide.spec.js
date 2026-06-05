import { expect, test } from "@playwright/test"
import { setZoomSlider, trackUnexpectedErrors } from "./helpers/flowchart.js"

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

test("flowchart interactions do not emit console errors", async ({ page }) => {
  const errors = trackUnexpectedErrors(page)
  await page.goto("/writing/algorithmic-flowchart/")

  await page.getByRole("button", { name: "Decision node: Is it a graph?" }).click()
  await setZoomSlider(page, 100)
  await page.evaluate(() => {
    globalThis.location.hash = "directed-graph"
  })
  await page.getByRole("button", { name: "Reset zoom" }).click()
  await page.getByRole("button", { name: "Decision Path" }).click()
  await page.locator("[data-flowchart-panel='path']").getByRole("button", { name: "Yes: Topological Sort" }).click()

  await expect(page.locator('[data-flowchart-node-id="directed-graph-topo"]')).toHaveAttribute("aria-pressed", "true")
  expect(errors).toEqual([])
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
