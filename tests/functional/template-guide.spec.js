import { expect, test } from "@playwright/test"
import { templatePanel } from "./helpers.js"

test("template guide opens old template hashes through redirects", async ({ page }) => {
  await page.goto("/writing/algorithmic-templates/#topological-sort")

  await expect(page.getByRole("heading", { name: "Algorithmic Templates" })).toBeVisible()
  await expect(page.getByRole("button", { name: "Graph" })).toHaveAttribute("aria-expanded", "true")
  await expect(page.getByRole("button", { name: "Topological sort" })).toHaveAttribute("aria-pressed", "true")
  await expect(templatePanel(page, "graph/topological-sort")).toBeVisible()
  await expect(page).toHaveURL(/#graph%2Ftopological-sort$/)
})

test("broad pattern targets open a compact chooser", async ({ page }) => {
  await page.goto("/writing/algorithmic-templates/#graph")

  const guide = page.locator(".template-library__nav")
  const graphTemplates = page.getByLabel("Graph templates")
  const chooser = page.locator('[data-template-pattern-panel][data-guide-pattern="graph"]')

  await expect(guide.getByRole("button", { name: "Graph" })).toHaveAttribute("aria-expanded", "true")
  await expect(graphTemplates.getByRole("button", { name: "DFS" })).toHaveAttribute("aria-pressed", "false")
  await expect(graphTemplates.getByRole("button", { name: "BFS" })).toHaveAttribute("aria-pressed", "false")
  await expect(page.locator('[aria-label="Tree templates"]')).toBeHidden()
  await expect(chooser).toBeVisible()
  await expect(chooser.getByRole("link", { name: /BFS/ })).toBeVisible()
  await expect(chooser.getByRole("link", { name: /Dijkstra/ })).toBeVisible()
  await expect(page.locator('[data-template-panel]:not([hidden])')).toHaveCount(0)
  await expect(page).toHaveURL(/#graph$/)
})

test("dynamic programming pattern exposes every concrete variant", async ({ page }) => {
  await page.goto("/writing/algorithmic-templates/#dynamic-programming")

  const guide = page.locator(".template-library__nav")
  const dynamicProgrammingTemplates = page.getByLabel("Dynamic Programming templates")
  const chooser = page.locator('[data-template-pattern-panel][data-guide-pattern="dynamic-programming"]')

  await expect(guide.getByRole("button", { name: "Dynamic Programming" })).toHaveAttribute("aria-expanded", "true")
  await expect(page.locator('[aria-label="Graph templates"]')).toBeHidden()
  await expect(dynamicProgrammingTemplates.getByRole("button", { name: "1D" })).toHaveAttribute("aria-pressed", "false")
  await expect(dynamicProgrammingTemplates.getByRole("button", { name: "Grid" })).toBeVisible()
  await expect(dynamicProgrammingTemplates.getByRole("button", { name: "Two sequences" })).toBeVisible()
  await expect(dynamicProgrammingTemplates.getByRole("button", { name: "Knapsack" })).toBeVisible()
  await expect(dynamicProgrammingTemplates.getByRole("button", { name: "Interval" })).toBeVisible()
  await expect(dynamicProgrammingTemplates.getByRole("button", { name: "Bitmask" })).toBeVisible()
  await expect(dynamicProgrammingTemplates.getByRole("button", { name: "LIS" })).toBeVisible()
  await expect(chooser).toBeVisible()
  await expect(chooser.getByRole("link", { name: /Interval/ })).toBeVisible()
  await expect(page.locator('[data-template-panel]:not([hidden])')).toHaveCount(0)
})

test("pattern chooser opens one concrete code panel", async ({ page }) => {
  await page.goto("/writing/algorithmic-templates/#graph")

  await page.locator('[data-template-pattern-panel][data-guide-pattern="graph"]').getByRole("link", { name: /BFS/ }).click()

  await expect(templatePanel(page, "graph/bfs")).toBeVisible()
  await expect(page.locator('[data-template-pattern-panel]:not([hidden])')).toHaveCount(0)
  await expect(page.locator("[data-template-panel]:not([hidden])")).toHaveCount(1)
  await expect(page.getByLabel("Graph templates").getByRole("button", { name: "BFS" })).toHaveAttribute("aria-pressed", "true")
  await expect(page).toHaveURL(/#graph%2Fbfs$/)
})

test("template search uses Pagefind results without expanding the outline", async ({ page }) => {
  await page.goto("/writing/algorithmic-templates/#binary-search")

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
  await expect(page.getByLabel("Dynamic Programming templates").getByRole("button", { name: "LIS" })).toHaveAttribute(
    "aria-pressed",
    "true"
  )
})

test("variant selection reveals the matching code panel", async ({ page }) => {
  await page.goto("/writing/algorithmic-templates/#stack")
  await page.locator(".template-library__nav").getByRole("button", { name: "Parse" }).click()

  await expect(templatePanel(page, "stack/parse")).toBeVisible()
  await expect(page.getByRole("toolbar", { name: "Language" })).toBeVisible()
})

test("every concrete template variant opens one matching code panel", async ({ page }) => {
  test.setTimeout(60000)

  await page.goto("/writing/algorithmic-templates/")

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
      "aria-pressed",
      "true"
    )
  }
})
