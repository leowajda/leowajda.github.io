import { expect, test } from "@playwright/test"
import { visibleFlowchartNodeCount } from "./helpers/flowchart.js"

test("flowchart renders a static fallback before JavaScript enhancement", async ({ page }) => {
  const response = await page.request.get("/writing/algorithmic-flowchart/")
  const html = await response.text()

  expect(html).toContain("data-flowchart-fallback")
  expect(html).toContain("Yes")
  expect(html).toContain("Is it a tree?")
  expect(html).toContain("Need the kth smallest or largest?")
})

test("flowchart page versions JavaScript asset URLs", async ({ page }) => {
  const response = await page.request.get("/writing/algorithmic-flowchart/")
  const html = await response.text()

  expect(html).toMatch(/\/assets\/css\/main\.css\?v=\d+/)
  expect(html).toMatch(/\/site\.webmanifest\?v=\d+/)
  expect(html).toMatch(/\/assets\/js\/core\.js\?v=\d+/)
  expect(html).toMatch(/\/assets\/js\/eureka-flowchart\.js\?v=\d+/)
  expect(html).toMatch(/data-pagefind-bundle="\/pagefind\/pagefind\.js\?v=\d+"/)
  expect(html).toMatch(/"\/assets\/js\/dom\.js":"\/assets\/js\/dom\.js\?v=\d+"/)
  expect(html).toMatch(/"\/assets\/js\/eureka-flowchart-node-state\.js":"\/assets\/js\/eureka-flowchart-node-state\.js\?v=\d+"/)
  expect(html).toMatch(/data-flowchart-x6-url="\/assets\/vendor\/x6\/x6\.min\.js\?v=\d+"/)
})

test("browser requests versioned local JavaScript modules", async ({ page }) => {
  const scriptRequests = []

  page.on("request", (request) => {
    const url = new URL(request.url())
    if (url.pathname.startsWith("/assets/js/")) {
      scriptRequests.push(url)
    }
  })

  await page.goto("/writing/algorithmic-flowchart/")
  await expect(page.getByRole("button", { name: "Decision node: Is it a graph?" })).toBeVisible()

  expect(scriptRequests.map((url) => url.pathname)).toContain("/assets/js/dom.js")
  expect(scriptRequests.map((url) => url.pathname)).toContain("/assets/js/eureka-flowchart-node-state.js")
  expect(scriptRequests.filter((url) => !url.searchParams.has("v")).map((url) => url.pathname)).toEqual([])
})

test("flowchart keeps the static fallback until the enhanced canvas is visible", async ({ page }) => {
  await page.goto("/writing/algorithmic-flowchart/")

  await expect(page.locator("[data-flowchart]")).toHaveClass(/flowchart-workspace--rendered/)
  await expect(page.locator("[data-flowchart-fallback]")).toBeHidden()
  await expect.poll(async () => visibleFlowchartNodeCount(page)).toBeGreaterThan(0)
})

test("flowchart fallback remains visible when X6 cannot load", async ({ page }) => {
  await page.route("**/assets/vendor/x6/x6.min.js*", (route) => route.abort())
  await page.goto("/writing/algorithmic-flowchart/")

  await expect(page.locator("[data-flowchart]")).not.toHaveClass(/flowchart-workspace--rendered/)
  await expect(page.locator("[data-flowchart-fallback]")).toBeVisible()
  await expect(page.getByRole("heading", { name: "Is it a graph?", level: 2 })).toBeVisible()
})

test("flowchart canvas labels branches on X6 ports instead of edges", async ({ page }) => {
  await page.goto("/writing/algorithmic-flowchart/")

  const surface = page.locator("[data-flowchart-surface]")
  await expect(page.getByRole("button", { name: "Decision node: Is it a graph?" })).toBeVisible()
  await expect(page.locator("[data-flowchart-fallback]")).toBeHidden()
  await expect(surface.locator(".x6-edge-label")).toHaveCount(0)
  await expect(surface.locator(".flowchart-port--yes").first()).toBeVisible()
  await expect(surface.locator(".flowchart-port--no").first()).toBeVisible()
  await expect(surface.locator(".x6-port-label").getByText("Yes").first()).toBeVisible()
  await expect(surface.locator(".x6-port-label").getByText("No").first()).toBeVisible()
})

test("flowchart canvas uses softened routed edges and stateful zoom controls", async ({ page }) => {
  await page.goto("/writing/algorithmic-flowchart/")

  const firstNode = page.locator('[data-flowchart-node-id="graph"]')
  await expect(firstNode).toBeVisible()
  await expect(page.getByRole("slider", { name: "Zoom" })).toBeVisible()
  await expect(page.getByRole("button", { name: "Zoom out" })).toBeVisible()
  await expect(page.getByRole("button", { name: "Zoom in" })).toBeVisible()
  await expect(page.getByRole("button", { name: "Reset zoom" })).toBeVisible()
  await expect(page.getByRole("slider", { name: "Zoom" })).toHaveAttribute("min", "32")
  await expect(page.getByRole("slider", { name: "Zoom" })).toHaveAttribute("max", "138")
  await expect(page.locator("[data-flowchart-minimap]")).toHaveCount(0)

  const curvedEdgeCount = await page.locator("[data-flowchart-surface] .x6-edge path").evaluateAll((paths) =>
    paths.filter((path) => (path.getAttribute("d") || "").includes("C")).length
  )
  expect(curvedEdgeCount).toBeGreaterThan(0)
})
