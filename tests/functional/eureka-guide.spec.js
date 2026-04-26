import { expect, test } from "@playwright/test"

test("problem code exposes derived template links beside the selected implementation", async ({ page }) => {
  await page.goto("/eureka/problems/binary-search/")

  const taxonomy = page.locator(".content-card").filter({ hasText: "Categories" }).first()
  const guideLink = taxonomy.getByRole("link", { name: "Binary Search / Boundary" })

  await expect(guideLink).toHaveAttribute("href", /\/writing\/algorithmic-templates\/#binary-search\/boundary$/)
  await expect(page.locator(".code-panel").getByRole("link", { name: "Binary Search / Boundary" })).toHaveCount(0)
  await expect(page.getByRole("button", { name: "Templates" })).toHaveCount(0)
})

test("multi-template problems expose every derived template as visible links", async ({ page }) => {
  await page.goto("/eureka/problems/sliding-puzzle/#java-iterative")

  const taxonomy = page.locator(".content-card").filter({ hasText: "Categories" }).first()

  await expect(taxonomy.getByRole("link", { name: "Grid / BFS" })).toHaveAttribute(
    "href",
    /\/writing\/algorithmic-templates\/#grid\/bfs$/
  )
  await expect(taxonomy.getByRole("link", { name: "Dynamic Programming" })).toHaveAttribute(
    "href",
    /\/writing\/algorithmic-templates\/#dynamic-programming$/
  )
  await expect(page.locator(".code-panel").getByRole("link", { name: "Grid / BFS" })).toHaveCount(0)
  await expect(page.getByRole("button", { name: "Templates" })).toHaveCount(0)
})

test("problem explorer filters by raw category", async ({ page }) => {
  await page.goto("/eureka/problems/")

  await expect(page.locator('input[name="pattern"]')).toHaveCount(0)
  await page.locator('input[name="category"][value="Dynamic Programming"]').check()

  await expect(page.locator('[data-problem-row][data-problem-slug="coin-change"]')).toBeVisible()
  await expect(page.locator('[data-problem-row][data-problem-slug="binary-search"]')).toBeHidden()
})
