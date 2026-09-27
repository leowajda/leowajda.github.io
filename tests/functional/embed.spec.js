import { expect, test } from "@playwright/test"

test("problem embed is chrome-free and exposes multi-language code UI", async ({ page }) => {
  await page.goto("/eureka/problems/binary-search/embed/")

  await expect(page.getByRole("navigation")).toHaveCount(0)
  await expect(page.locator("[data-search-open]")).toHaveCount(0)
  await expect(page.locator("[data-embed-page]")).toBeVisible()
  await expect(page.locator("[data-code-collection]")).toBeVisible()

  const languages = page.locator("[data-code-collection-language-control]")
  await expect(languages).toHaveCount(4)

  await page.getByRole("button", { name: "Python" }).click()
  await expect(page.getByRole("button", { name: "Python" })).toHaveAttribute("aria-pressed", "true")
})

test("template embed is chrome-free", async ({ page }) => {
  await page.goto("/templates/binary-search/embed/")

  await expect(page.getByRole("navigation")).toHaveCount(0)
  await expect(page.locator("[data-embed-page]")).toBeVisible()
  await expect(page.getByRole("toolbar", { name: "Language" })).toBeVisible()
})

test("source note code page links to a chrome-free embed", async ({ page }) => {
  const detail = "/zibaldone/java/cracking-the-coding-interview/cracking-the-coding-interview/ch-04/route-between-nodes/"
  await page.goto(detail)

  await expect(page.getByRole("heading", { name: "RouteBetweenNodes.java" })).toBeVisible()
  await page.goto(`${detail}embed/`)
  await expect(page.getByRole("navigation")).toHaveCount(0)
  await expect(page.locator("[data-embed-page]")).toBeVisible()
  await expect(page.getByRole("toolbar", { name: "Language" })).toBeVisible()
})

test("problem embed posts resize messages to the parent frame", async ({ page }) => {
  await page.goto("/eureka/problems/")

  const height = await page.evaluate(async () => {
    return await new Promise((resolve, reject) => {
      const timer = globalThis.setTimeout(() => reject(new Error("resize message timeout")), 5000)
      const onMessage = (event) => {
        if (event.data?.source === "remnote-iframe-plugin" && event.data?.type === "resize") {
          globalThis.clearTimeout(timer)
          globalThis.removeEventListener("message", onMessage)
          resolve(event.data.height)
        }
      }
      globalThis.addEventListener("message", onMessage)

      const iframe = globalThis.document.createElement("iframe")
      iframe.src = "/eureka/problems/binary-search/embed/"
      iframe.style.width = "100%"
      iframe.style.border = "0"
      globalThis.document.body.append(iframe)
    })
  })

  expect(height).toBeGreaterThan(100)
})
