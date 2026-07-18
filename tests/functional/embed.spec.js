import { expect, test } from "@playwright/test"

test("problem embed is chrome-free and exposes multi-language code UI", async ({ page }) => {
  await page.goto("/eureka/problems/binary-search/embed/")

  await expect(page.locator("nav.site-nav")).toHaveCount(0)
  await expect(page.locator("[data-search-open]")).toHaveCount(0)
  await expect(page.locator("[data-embed-page]")).toBeVisible()
  await expect(page.locator("[data-code-collection]")).toBeVisible()

  const languages = page.locator("[data-code-collection-language-control]")
  await expect(languages).toHaveCount(4)

  await page.locator('[data-code-collection-language-control][data-code-collection-language="python"]').click()
  await expect(
    page.locator('[data-code-collection-language-control][data-code-collection-language="python"]')
  ).toHaveClass(/is-active/)
})

test("problem embed posts resize messages to the parent frame", async ({ page }) => {
  await page.goto("/eureka/problems/")

  const height = await page.evaluate(async () => {
    return await new Promise((resolve, reject) => {
      const timer = window.setTimeout(() => reject(new Error("resize message timeout")), 5000)
      const onMessage = (event) => {
        if (event.data?.source === "remnote-iframe-plugin" && event.data?.type === "resize") {
          window.clearTimeout(timer)
          window.removeEventListener("message", onMessage)
          resolve(event.data.height)
        }
      }
      window.addEventListener("message", onMessage)

      const iframe = document.createElement("iframe")
      iframe.src = "/eureka/problems/binary-search/embed/"
      iframe.style.width = "100%"
      iframe.style.border = "0"
      document.body.append(iframe)
    })
  })

  expect(height).toBeGreaterThan(100)
})
