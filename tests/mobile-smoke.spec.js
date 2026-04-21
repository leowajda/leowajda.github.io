const { test, expect } = require("@playwright/test")

test("homepage renders on mobile", async ({ page }) => {
  await page.goto("/")

  await expect(page.getByRole("heading", { name: "Leonardo Wajda" })).toBeVisible()
  await expect(page.getByRole("heading", { name: "Projects" })).toBeVisible()
  await expect(page.getByRole("link", { name: "GitHub profile" })).toBeVisible()
})

test("problem page keeps language and approach controls visible", async ({ page }) => {
  await page.goto("/eureka/problems/lowest-common-ancestor-of-a-binary-search-tree/#scala-recursive")

  await expect(page.getByRole("heading", { name: "Lowest Common Ancestor of a Binary Search Tree" })).toBeVisible()
  await expect(page.getByRole("toolbar", { name: "Language" })).toBeVisible()

  const approachToolbar = page.getByRole("toolbar", { name: "Approach" })
  await expect(approachToolbar).toBeVisible()
  await expect(approachToolbar.getByRole("button", { name: "Iterative" })).toBeDisabled()
  await expect(approachToolbar.getByRole("button", { name: "Recursive" })).toHaveAttribute("aria-pressed", "true")
})

test("template page loads the selected template on mobile", async ({ page }) => {
  await page.goto("/writing/algorithmic-templates/#binary-search")

  await expect(page.getByRole("heading", { name: "Algorithmic Templates" })).toBeVisible()
  await expect(
    page.locator('[data-template-nav][data-template-target="binary-search"]')
  ).toHaveAttribute("aria-pressed", "true")
  await expect(
    page.locator('[data-template-panel][data-template-id="binary-search"]')
  ).toBeVisible()
  await expect(page.getByRole("toolbar", { name: "Language" })).toBeVisible()
})

test("flowchart page opens the selected node on mobile", async ({ page }) => {
  await page.goto("/writing/algorithmic-flowchart/#directed-graph-topo")

  await expect(page.getByRole("heading", { name: "Algorithmic Flowchart" })).toBeVisible()
  await expect(page.getByRole("button", { name: "Solution node: Topological Sort" })).toHaveAttribute("aria-pressed", "true")
  await expect(page.getByRole("heading", { name: "Topological Sort", level: 2 })).toBeVisible()
})
