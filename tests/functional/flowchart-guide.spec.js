import { expect, test } from "@playwright/test"

const FOCUS_SCALE = 0.78

const flowchartSurface = (page) => page.locator("[data-flowchart-surface]")

const flowchartScale = async (page) =>
  Number.parseFloat(await flowchartSurface(page).getAttribute("data-flowchart-scale"))

const centerOffset = async (page, locator) => {
  const [surfaceRect, nodeRect] = await Promise.all([
    flowchartSurface(page).evaluate((element) => {
      const rect = element.getBoundingClientRect()
      return {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height
      }
    }),
    locator.evaluate((element) => {
      const rect = element.getBoundingClientRect()
      return {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height
      }
    })
  ])
  const surfaceCenterX = surfaceRect.x + surfaceRect.width / 2
  const surfaceCenterY = surfaceRect.y + surfaceRect.height / 2
  const nodeCenterX = nodeRect.x + nodeRect.width / 2
  const nodeCenterY = nodeRect.y + nodeRect.height / 2

  return Math.hypot(nodeCenterX - surfaceCenterX, nodeCenterY - surfaceCenterY)
}

const expectScaleNear = async (page, target, tolerance = 0.04) => {
  await expect.poll(async () => Math.abs((await flowchartScale(page)) - target)).toBeLessThan(tolerance)
}

const expectCentered = async (page, locator, tolerance = 90) => {
  await expect.poll(async () => centerOffset(page, locator)).toBeLessThan(tolerance)
}

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

test("flowchart renders a static fallback before JavaScript enhancement", async ({ page }) => {
  const response = await page.request.get("/writing/algorithmic-flowchart/")
  const html = await response.text()

  expect(html).toContain("data-flowchart-fallback")
  expect(html).toContain("Yes")
  expect(html).toContain("Is it a tree?")
  expect(html).toContain("Need the kth smallest or largest?")
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
  await expect(page.locator("[data-flowchart-fallback]")).toBeHidden()
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
  await page.getByRole("button", { name: "Zoom to 1:1" }).click()
  await expectScaleNear(page, 1)
  await expect(page.getByRole("button", { name: "Decision node: Is it a graph?" })).toBeVisible()

  if ((page.viewportSize()?.width || 0) > 820) {
    const widthBeforeWheel = await firstNode.evaluate((element) => element.getBoundingClientRect().width)
    await page.locator("[data-flowchart-surface]").hover()
    await page.mouse.wheel(0, -600)
    await expect.poll(async () => {
      const width = await firstNode.evaluate((element) => element.getBoundingClientRect().width)
      return Math.abs(width - widthBeforeWheel)
    }).toBeGreaterThan(4)
  }
})

test("node activation focuses the selected node at the standard focus scale", async ({ page }) => {
  await page.goto("/writing/algorithmic-flowchart/")

  const graphNode = page.locator('[data-flowchart-node-id="graph"]')
  await expect(graphNode).toBeVisible()

  await page.getByRole("button", { name: "Zoom out" }).click()
  await expect.poll(async () => flowchartScale(page)).toBeLessThan(1)

  await page.getByRole("button", { name: "Decision node: Is it a graph?" }).click()

  await expect(graphNode).toHaveAttribute("aria-pressed", "true")
  await expectScaleNear(page, FOCUS_SCALE)
  await expectCentered(page, graphNode)
})

test("decision path activation focuses route nodes at the standard focus scale", async ({ page }) => {
  await page.goto("/writing/algorithmic-flowchart/#shortest-path-dijkstra")

  await page.getByRole("button", { name: "Zoom out" }).click()
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

test("decision path shows root children as next choices", async ({ page }) => {
  await page.goto("/writing/algorithmic-flowchart/#graph")

  await page.getByRole("button", { name: "Decision Path" }).click()

  const path = page.locator("[data-flowchart-panel='path']")
  await expect(path.getByText("Next")).toBeVisible()
  await expect(path.getByRole("button", { name: "Yes: Is it a tree?" })).toBeVisible()
  await expect(path.getByRole("button", { name: "No: Need the kth smallest or largest?" })).toBeVisible()
})

test("decision path shows children for deeper decision nodes", async ({ page }) => {
  await page.goto("/writing/algorithmic-flowchart/#directed-graph")

  await page.getByRole("button", { name: "Decision Path" }).click()

  const path = page.locator("[data-flowchart-panel='path']")
  await expect(path.getByRole("button", { name: "Yes: Topological Sort" })).toBeVisible()
  await expect(path.getByRole("button", { name: "No: Is the problem related to shortest paths?" })).toBeVisible()
})

test("decision path choices move forward through the flowchart", async ({ page }) => {
  await page.goto("/writing/algorithmic-flowchart/#sums")

  await page.getByRole("button", { name: "Zoom out" }).click()
  await page.getByRole("button", { name: "Decision Path" }).click()

  const path = page.locator("[data-flowchart-panel='path']")
  await expect(path.getByRole("button", { name: "Yes: Prefix Sums" })).toBeVisible()
  await path.getByRole("button", { name: "No: About subarrays or substrings?" }).click()

  const subarraysNode = page.getByRole("button", { name: "Decision node: About subarrays or substrings?" })
  await expect(subarraysNode).toHaveAttribute("aria-pressed", "true")
  await expect(page.getByRole("heading", { name: "About subarrays or substrings?", level: 2 })).toBeVisible()
  await expect(path.getByRole("button", { name: "No: Calculating a maximum or minimum?" })).toBeVisible()
  await expectScaleNear(page, FOCUS_SCALE)
  await expectCentered(page, subarraysNode)
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
