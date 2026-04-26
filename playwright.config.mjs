import { defineConfig, devices } from "@playwright/test"

const previewUrl = "http://127.0.0.1:4173"

export default defineConfig({
  testDir: "tests/functional",
  use: {
    baseURL: previewUrl,
    colorScheme: "light",
    trace: "on-first-retry"
  },
  webServer: {
    command: "python3 -m http.server 4173 --bind 127.0.0.1 --directory _site",
    url: previewUrl,
    reuseExistingServer: !process.env.CI,
    timeout: 120000
  },
  expect: {
    timeout: 10000
  },
  reporter: process.env.CI ? [["github"], ["list"]] : "list",
  projects: [
    {
      name: "desktop-chromium",
      use: {
        ...devices["Desktop Chrome"],
        browserName: "chromium"
      }
    },
    {
      name: "mobile-chromium",
      use: {
        ...devices["Pixel 5"],
        browserName: "chromium",
        viewport: { width: 390, height: 844 }
      }
    }
  ],
  outputDir: "tmp/playwright",
  timeout: 30000,
  workers: 1
})
