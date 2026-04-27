import { expect, test } from "@playwright/test"

test("homepage renders primary destinations", async ({ page }) => {
  await page.goto("/")

  await expect(page.getByRole("heading", { name: "Leonardo Wajda" })).toBeVisible()
  await expect(page.getByRole("heading", { name: "Projects" })).toBeVisible()
  await expect(page.getByRole("link", { name: "GitHub profile" })).toBeVisible()
  await expect(page.getByText(/Projects<div/)).toHaveCount(0)
  await expect(page.getByText("</article>")).toHaveCount(0)
  await expect(page.locator(".content-stack .content-card").first()).toBeVisible()

  const zibaldoneHeading = page.getByRole("heading", { name: "Zibaldone" })
  await expect(zibaldoneHeading).toBeVisible()
  await expect(zibaldoneHeading.locator("a")).toHaveCount(0)
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
