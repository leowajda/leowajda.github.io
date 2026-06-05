import { expect, test } from "@playwright/test"
import {
  expectCentered,
  expectScaleNear,
  flowchartScale,
  flowchartSurface,
  FOCUS_SCALE,
  setZoomSlider
} from "./helpers/flowchart.js"

test("flowchart wheel input keeps page scrolling separate from deliberate zoom", async ({ page }) => {
  await page.goto("/writing/algorithmic-flowchart/")

  const firstNode = page.locator('[data-flowchart-node-id="graph"]')
  await expect(firstNode).toBeVisible()

  await flowchartSurface(page).hover()
  const scaleBeforeWheel = await flowchartScale(page)
  const scrollBefore = await page.evaluate(() => globalThis.scrollY)
  await page.mouse.wheel(0, 600)

  await expect.poll(async () => page.evaluate(() => globalThis.scrollY)).toBeGreaterThan(scrollBefore)
  await expect.poll(async () => Math.abs((await flowchartScale(page)) - scaleBeforeWheel)).toBeLessThan(0.01)

  if ((page.viewportSize()?.width || 0) > 820) {
    const widthBeforeWheel = await firstNode.evaluate((element) => element.getBoundingClientRect().width)
    await page.evaluate(() => globalThis.scrollTo(0, 0))
    await page.locator("[data-flowchart-surface]").hover()
    await page.keyboard.down("Control")
    await page.mouse.wheel(0, -600)
    await page.keyboard.up("Control")
    await expect.poll(async () => {
      const width = await firstNode.evaluate((element) => element.getBoundingClientRect().width)
      return Math.abs(width - widthBeforeWheel)
    }).toBeGreaterThan(4)
  }
})

test("manual zoom controls preserve scale when selection changes", async ({ page }) => {
  await page.goto("/writing/algorithmic-flowchart/")

  await expect(page.getByRole("slider", { name: "Zoom" })).toBeVisible()
  await setZoomSlider(page, 100)
  await expectScaleNear(page, 1, 0.02)
  await expect(flowchartSurface(page)).toHaveAttribute("data-flowchart-zoom-mode", "manual")

  await page.evaluate(() => {
    globalThis.location.hash = "directed-graph"
  })

  const selectedNode = page.locator('[data-flowchart-node-id="directed-graph"]')
  await expect(selectedNode).toHaveAttribute("aria-pressed", "true")
  await expectScaleNear(page, 1, 0.03)
  await expectCentered(page, selectedNode)
})

test("reset zoom returns selection focus to automatic scale", async ({ page }) => {
  await page.goto("/writing/algorithmic-flowchart/")

  await setZoomSlider(page, 100)
  await page.evaluate(() => {
    globalThis.location.hash = "directed-graph"
  })

  const selectedNode = page.locator('[data-flowchart-node-id="directed-graph"]')
  await expect(selectedNode).toHaveAttribute("aria-pressed", "true")
  await expectScaleNear(page, 1, 0.03)

  await page.getByRole("button", { name: "Reset zoom" }).click()

  await expect(flowchartSurface(page)).toHaveAttribute("data-flowchart-zoom-mode", "auto")
  await expectScaleNear(page, FOCUS_SCALE)
  await expectCentered(page, selectedNode)
})

test("node activation focuses the selected node at the standard focus scale", async ({ page }) => {
  await page.goto("/writing/algorithmic-flowchart/")

  const graphNode = page.locator('[data-flowchart-node-id="graph"]')
  await expect(graphNode).toBeVisible()

  await page.getByRole("button", { name: "Decision node: Is it a graph?" }).click()
  await flowchartSurface(page).hover()
  await page.mouse.wheel(0, 600)

  await expect(graphNode).toHaveAttribute("aria-pressed", "true")
  await expectScaleNear(page, FOCUS_SCALE)
  await expectCentered(page, graphNode)
})

test("decision path activation focuses route nodes at the standard focus scale", async ({ page }) => {
  await page.goto("/writing/algorithmic-flowchart/#shortest-path-dijkstra")

  await page.getByRole("button", { name: "Decision Path" }).click()

  const path = page.locator("[data-flowchart-panel='path']")
  const entry = path.getByRole("button", { name: "Is the graph weighted?" })
  await entry.locator(".flowchart-path__answer").click()

  const weightedNode = page.getByRole("button", { name: "Decision node: Is the graph weighted?" })
  await expect(weightedNode).toHaveAttribute("aria-pressed", "true")
  await expect(page.getByRole("heading", { name: "Is the graph weighted?", level: 2 })).toBeVisible()
  await expectScaleNear(page, FOCUS_SCALE)
  await expectCentered(page, weightedNode)
})

test("hash selection focuses the mobile canvas on the selected node", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto("/writing/algorithmic-flowchart/")

  await expect(page.getByRole("button", { name: "Decision node: Is it a graph?" })).toBeVisible()

  await page.evaluate(() => {
    globalThis.location.hash = "counting-dp"
  })
  await expect(page.getByRole("heading", { name: "Dynamic Programming", level: 2 })).toBeVisible()

  const selectedNode = page.locator('[data-flowchart-node-id="counting-dp"]')
  await expect(selectedNode).toHaveAttribute("aria-pressed", "true")
  await expectScaleNear(page, FOCUS_SCALE)
  await expectCentered(page, selectedNode)
})

test("initial deep hashes reveal the selected flowchart node", async ({ page }) => {
  await page.goto("/writing/algorithmic-flowchart/#maximum-minimum-monotonic")

  const surface = page.locator("[data-flowchart-surface]")
  const selectedNode = page.locator('[data-flowchart-node-id="maximum-minimum-monotonic"]')
  await expect(selectedNode).toHaveAttribute("aria-pressed", "true")
  await expect(page.getByRole("heading", { name: "Monotonic condition?", level: 2 })).toBeVisible()
  await expectScaleNear(page, FOCUS_SCALE)

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
