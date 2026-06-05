import { expect } from "@playwright/test"

export const FOCUS_SCALE = 0.78

export const flowchartSurface = (page) => page.locator("[data-flowchart-surface]")

export const flowchartScale = async (page) =>
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

export const expectScaleNear = async (page, target, tolerance = 0.04) => {
  await expect.poll(async () => Math.abs((await flowchartScale(page)) - target)).toBeLessThan(tolerance)
}

export const expectCentered = async (page, locator, tolerance = 90) => {
  await expect.poll(async () => centerOffset(page, locator)).toBeLessThan(tolerance)
}

export const trackUnexpectedErrors = (page) => {
  const errors = []

  page.on("console", (message) => {
    if (message.type() === "error") {
      errors.push(message.text())
    }
  })
  page.on("pageerror", (error) => {
    errors.push(error.message)
  })

  return errors
}

export const setZoomSlider = async (page, percent) => {
  await page.getByRole("slider", { name: "Zoom" }).evaluate((input, value) => {
    input.value = value.toString()
    input.dispatchEvent(new Event("input", { bubbles: true }))
  }, percent)
}

export const visibleFlowchartNodeCount = async (page) =>
  flowchartSurface(page).locator("[data-flowchart-node]").evaluateAll((nodes) =>
    nodes.filter((node) => {
      const rect = node.getBoundingClientRect()
      return rect.width > 0 && rect.height > 0
    }).length
  )
