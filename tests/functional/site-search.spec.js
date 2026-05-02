import { expect, test } from "@playwright/test"
import { openSearchOverlay } from "./helpers.js"

test("global search opens as an overlay from the main navigation", async ({ page }) => {
  await page.goto("/")

  const overlay = await openSearchOverlay(page)
  await overlay.getByRole("searchbox", { name: "Search" }).fill("grid bfs")

  await expect(page.locator('[data-search-result-link][href="/writing/algorithmic-templates/#grid/bfs"]')).toBeVisible()
  await expect(
    page.locator(".search-result").filter({
      has: page.locator('[data-search-result-link][href="/writing/algorithmic-templates/#grid/bfs"]')
    }).locator(".search-result__meta")
  ).toContainText("Template: Grid")
  await expect(
    page.locator(".search-result__meta").filter({ hasText: "Flowchart: Unweighted shortest paths / Solution" })
  ).toBeVisible()
  await expect(
    page.locator(".search-result__meta").filter({ hasText: "Flowchart: Small constraints / Solution" })
  ).toBeVisible()
})

test("global search waits for meaningful query length", async ({ page }) => {
  await page.goto("/")

  const overlay = await openSearchOverlay(page)
  await overlay.getByRole("searchbox", { name: "Search" }).fill("b")

  await expect(page.locator("[data-search-summary]")).toHaveText("Type at least 2 characters.")
  await expect(page.locator(".search-result")).toHaveCount(0)
})

test("search route opens the same overlay without faceted panels", async ({ page }) => {
  await page.goto("/search/?q=binary+sear&kind=Source&kind=Template&kind=Problem&kind=Flowchart&kind=Writing")

  const overlay = page.getByRole("dialog", { name: "Search" })

  await expect(overlay).toBeVisible()
  await expect(overlay.getByRole("searchbox", { name: "Search" })).toHaveValue("binary sear")
  await expect(page.locator("[data-search-filters]")).toHaveCount(0)
  await expect(page.getByRole("link", { name: /Binary Search/ }).first()).toBeVisible()
})

test("global search supports keyboard navigation and escape closing", async ({ page }) => {
  await page.goto("/")

  const overlay = await openSearchOverlay(page, "keyboard")
  const searchbox = overlay.getByRole("searchbox", { name: "Search" })

  await searchbox.fill("grid bfs")
  const result = page.locator("[data-search-result-link]").first()
  await expect(result).toBeVisible()

  await page.keyboard.press("ArrowDown")
  await expect(result).toBeFocused()

  await page.keyboard.press("Escape")
  await expect(overlay).toBeHidden()
})

test("global search preserves Pagefind result order when loading more", async ({ page }) => {
  await page.goto("/")

  const overlay = await openSearchOverlay(page)
  await overlay.getByRole("searchbox", { name: "Search" }).fill("java")

  const links = page.locator("[data-search-result-link]")
  await expect(links).toHaveCount(8)
  const firstPageHrefs = await links.evaluateAll((elements) => elements.map((element) => element.href))

  await overlay.getByRole("button", { name: /Show \d+ more/ }).click()
  await expect(links).toHaveCount(16)
  const expandedHrefs = await links.evaluateAll((elements) => elements.slice(0, 8).map((element) => element.href))

  expect(expandedHrefs).toEqual(firstPageHrefs)
})

test("global search opens the focused result from the keyboard", async ({ page }) => {
  await page.goto("/")

  await page.keyboard.press("/")
  const overlay = page.getByRole("dialog", { name: "Search" })
  await overlay.getByRole("searchbox", { name: "Search" }).fill("grid bfs")
  const result = page.locator("[data-search-result-link]").first()
  await expect(result).toBeVisible()
  const href = await result.getAttribute("href")

  await page.keyboard.press("ArrowDown")
  await page.keyboard.press("Enter")

  await expect(page).toHaveURL(new URL(href, page.url()).toString())
})

test("problem explorer text search is backed by Pagefind", async ({ page }) => {
  await page.goto("/eureka/problems/")

  await page.getByRole("searchbox", { name: "Search" }).fill("sliding puzzle")

  await expect(page.locator('[data-problem-row][data-problem-slug="sliding-puzzle"]')).toBeVisible()
  await expect(page.locator('[data-problem-row][data-problem-slug="binary-search"]')).toBeHidden()
})

test("problem explorer combines text search with Pagefind filters", async ({ page }) => {
  await page.goto("/eureka/problems/")

  await page.getByRole("searchbox", { name: "Search" }).fill("kth")
  await page.locator('input[name="category"][value="Matrix"]').check()

  await expect(page.locator('[data-problem-row][data-problem-slug="kth-smallest-element-in-a-sorted-matrix"]')).toBeVisible()
  await expect(page.locator('[data-problem-row][data-problem-slug="kth-largest-element-in-an-array"]')).toBeHidden()
})
