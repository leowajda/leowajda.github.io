import { expect, test } from "@playwright/test"
import { templatePanel } from "./helpers.js"

test("template guide opens old template hashes through redirects", async ({ page }) => {
  await page.goto("/templates/#topological-sort")

  await expect(page.getByRole("heading", { name: "Algorithmic Templates" })).toBeVisible()
  await expect(page.getByRole("link", { name: "Graph", exact: true })).toHaveAttribute("aria-expanded", "true")
  await expect(page.getByRole("link", { name: "Topological sort" })).toHaveAttribute("aria-current", "true")
  await expect(templatePanel(page, "graph/topological-sort")).toBeVisible()
  await expect(page).toHaveURL(/#graph%2Ftopological-sort$/)
})

test("broad pattern targets open a compact chooser", async ({ page }) => {
  await page.goto("/templates/#graph")

  const guide = page.locator(".template-library__nav")
  const graphTemplates = page.getByLabel("Graph templates")
  const chooser = page.locator('[data-template-pattern-panel][data-guide-pattern="graph"]')

  await expect(guide.getByRole("link", { name: "Graph", exact: true })).toHaveAttribute("aria-expanded", "true")
  await expect(graphTemplates.getByRole("link", { name: "DFS" })).not.toHaveAttribute("aria-current", "true")
  await expect(graphTemplates.getByRole("link", { name: "BFS" })).not.toHaveAttribute("aria-current", "true")
  await expect(page.locator('[aria-label="Tree templates"]')).toBeHidden()
  await expect(chooser).toBeVisible()
  await expect(chooser.getByRole("link", { name: /BFS/ })).toBeVisible()
  await expect(chooser.getByRole("link", { name: /Dijkstra/ })).toBeVisible()
  await expect(page.locator("[data-template-panel]:not([hidden])")).toHaveCount(0)
  await expect(page).toHaveURL(/#graph$/)
})

test("dynamic programming pattern exposes every concrete variant", async ({ page }) => {
  await page.goto("/templates/#dynamic-programming")

  const guide = page.locator(".template-library__nav")
  const dynamicProgrammingTemplates = page.getByLabel("Dynamic Programming templates")
  const chooser = page.locator('[data-template-pattern-panel][data-guide-pattern="dynamic-programming"]')

  await expect(guide.getByRole("link", { name: "Dynamic Programming", exact: true })).toHaveAttribute(
    "aria-expanded",
    "true"
  )
  await expect(page.locator('[aria-label="Graph templates"]')).toBeHidden()
  await expect(dynamicProgrammingTemplates.getByRole("link", { name: "1D" })).toBeVisible()
  await expect(dynamicProgrammingTemplates.getByRole("link", { name: "Grid" })).toBeVisible()
  await expect(dynamicProgrammingTemplates.getByRole("link", { name: "Two sequences" })).toBeVisible()
  await expect(dynamicProgrammingTemplates.getByRole("link", { name: "Knapsack" })).toBeVisible()
  await expect(dynamicProgrammingTemplates.getByRole("link", { name: "Interval" })).toBeVisible()
  await expect(dynamicProgrammingTemplates.getByRole("link", { name: "Bitmask" })).toBeVisible()
  await expect(dynamicProgrammingTemplates.getByRole("link", { name: "LIS" })).toBeVisible()
  await expect(chooser).toBeVisible()
  await expect(chooser.getByRole("link", { name: /Interval/ })).toBeVisible()
  await expect(page.locator("[data-template-panel]:not([hidden])")).toHaveCount(0)
})

test("pattern chooser opens one concrete code panel", async ({ page }) => {
  await page.goto("/templates/#graph")

  await page.locator('[data-template-pattern-panel][data-guide-pattern="graph"]').getByRole("link", { name: /BFS/ }).click()

  await expect(templatePanel(page, "graph/bfs")).toBeVisible()
  await expect(page.locator("[data-template-pattern-panel]:not([hidden])")).toHaveCount(0)
  await expect(page.locator("[data-template-panel]:not([hidden])")).toHaveCount(1)
  await expect(page.getByLabel("Graph templates").getByRole("link", { name: "BFS" })).toHaveAttribute(
    "aria-current",
    "true"
  )
  await expect(page).toHaveURL(/#graph%2Fbfs$/)
})

test("template search uses Pagefind results without expanding the outline", async ({ page }) => {
  await page.goto("/templates/#binary-search")

  const searchbox = page.getByRole("searchbox", { name: "Patterns" })
  await searchbox.fill("lis")

  const results = page.locator("[data-template-search-results]")
  const lisResult = results.getByRole("link", { name: /Dynamic Programming LIS/ })

  await expect(page.locator("[data-template-outline]")).toBeHidden()
  await expect(lisResult).toBeVisible()
  await expect(page.locator('[aria-label="Graph templates"]')).toBeHidden()

  await lisResult.click()

  await expect(searchbox).toHaveValue("")
  await expect(page.locator("[data-template-outline]")).toBeVisible()
  const panel = templatePanel(page, "dynamic-programming/lis")
  await expect(panel).toBeVisible()
  await expect(panel.getByText("Keep the smallest possible tail for each increasing length.")).toBeVisible()
  await expect(page.getByLabel("Dynamic Programming templates").getByRole("link", { name: "LIS" })).toHaveAttribute(
    "aria-current",
    "true"
  )
})

test("variant selection reveals the matching code panel", async ({ page }) => {
  await page.goto("/templates/#stack")
  await page.locator(".template-library__nav").getByRole("link", { name: "Parse" }).click()

  await expect(templatePanel(page, "stack/parse")).toBeVisible()
  await expect(page.getByRole("toolbar", { name: "Language" })).toBeVisible()
})

test("every concrete template variant opens one matching code panel", async ({ page }) => {
  test.setTimeout(60000)

  await page.goto("/templates/")

  const variants = await page.locator('[data-guide-variant-control][data-guide-has-template="true"]').evaluateAll(
    (controls) => controls.map((control) => ({
      pattern: control.getAttribute("data-guide-pattern"),
      target: control.getAttribute("data-guide-target")
    }))
  )

  for (const { pattern, target } of variants) {
    await page.locator(`[data-guide-pattern-control][data-guide-pattern="${pattern}"]`).click()
    await page.locator(`[data-guide-variant-control][data-guide-target="${target}"]`).click()

    await expect(templatePanel(page, target)).toBeVisible()
    await expect(page.locator("[data-template-panel]:not([hidden])")).toHaveCount(1)
    await expect(page.locator(`[data-guide-variant-control][data-guide-target="${target}"]`)).toHaveAttribute(
      "aria-current",
      "true"
    )
  }
})
