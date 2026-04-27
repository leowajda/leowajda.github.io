import { expect } from "@playwright/test"

export const openSearchOverlay = async (page, trigger = "link") => {
  if (trigger === "keyboard") {
    await page.keyboard.press("ControlOrMeta+K")
  } else {
    await page.getByRole("link", { name: "Search" }).click()
  }

  const overlay = page.getByRole("dialog", { name: "Search" })
  await expect(overlay).toBeVisible()
  return overlay
}

export const templatePanel = (page, target) =>
  page.locator(`[data-template-panel][data-guide-target="${target}"]`)
