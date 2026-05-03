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

test("flowchart canvas labels branches on X6 ports instead of edges", async ({ page }) => {
  await page.goto("/writing/algorithmic-flowchart/")

  const surface = page.locator("[data-flowchart-surface]")
  await expect(page.getByRole("button", { name: "Decision node: Is it a graph?" })).toBeVisible()
  await expect(surface.locator(".x6-edge-label")).toHaveCount(0)
  await expect(surface.locator(".flowchart-port--yes").first()).toBeVisible()
  await expect(surface.locator(".flowchart-port--no").first()).toBeVisible()
  await expect(surface.locator(".x6-port-label").getByText("Yes").first()).toBeVisible()
  await expect(surface.locator(".x6-port-label").getByText("No").first()).toBeVisible()
})

test("flowchart canvas uses softened routed edges and explicit zoom controls", async ({ page }) => {
  await page.goto("/writing/algorithmic-flowchart/")

  const firstNode = page.locator('[data-flowchart-node-id="graph"]')
  await expect(firstNode).toBeVisible()

  const curvedEdgeCount = await page.locator("[data-flowchart-surface] .x6-edge path").evaluateAll((paths) =>
    paths.filter((path) => (path.getAttribute("d") || "").includes("C")).length
  )
  expect(curvedEdgeCount).toBeGreaterThan(0)

  const widthBefore = await firstNode.evaluate((element) => element.getBoundingClientRect().width)
  await page.getByRole("button", { name: "Zoom in" }).click()
  await expect.poll(async () => firstNode.evaluate((element) => element.getBoundingClientRect().width))
    .toBeGreaterThan(widthBefore)

  await page.getByRole("button", { name: "Zoom out" }).click()
  await page.getByRole("button", { name: "Reset zoom" }).click()
  await expect(page.getByRole("button", { name: "Decision node: Is it a graph?" })).toBeVisible()
})

test("hash selection keeps the mobile canvas position stable", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto("/writing/algorithmic-flowchart/")

  const viewport = page.locator(".x6-graph-svg-viewport")
  await expect(page.getByRole("button", { name: "Decision node: Is it a graph?" })).toBeVisible()

  const before = await viewport.evaluate((element) => {
    const rect = element.getBoundingClientRect()
    return { x: Math.round(rect.x), y: Math.round(rect.y) }
  })

  await page.evaluate(() => {
    globalThis.location.hash = "counting-dp"
  })
  await expect(page.getByRole("heading", { name: "Dynamic Programming", level: 2 })).toBeVisible()

  const after = await viewport.evaluate((element) => {
    const rect = element.getBoundingClientRect()
    return { x: Math.round(rect.x), y: Math.round(rect.y) }
  })
  expect(after).toEqual(before)
})

test("initial deep hashes reveal the selected flowchart node", async ({ page }) => {
  await page.goto("/writing/algorithmic-flowchart/#maximum-minimum-monotonic")

  const surface = page.locator("[data-flowchart-surface]")
  const selectedNode = page.locator('[data-flowchart-node-id="maximum-minimum-monotonic"]')
  await expect(selectedNode).toHaveAttribute("aria-pressed", "true")
  await expect(page.getByRole("heading", { name: "Monotonic condition?", level: 2 })).toBeVisible()

  const visible = await Promise.all([
    surface.evaluate((element) => {
      const rect = element.getBoundingClientRect()
      return { top: rect.top, bottom: rect.bottom, left: rect.left, right: rect.right }
    }),
    selectedNode.evaluate((element) => {
      const rect = element.getBoundingClientRect()
      return { top: rect.top, bottom: rect.bottom, left: rect.left, right: rect.right }
    })
  ]).then(([surfaceRect, nodeRect]) =>
    nodeRect.top >= surfaceRect.top &&
    nodeRect.bottom <= surfaceRect.bottom &&
    nodeRect.left >= surfaceRect.left &&
    nodeRect.right <= surfaceRect.right
  )

  expect(visible).toBe(true)
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
