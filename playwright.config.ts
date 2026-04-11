import { defineConfig } from "@playwright/test"
import { previewUrl } from "./tools/src/core/preview.js"

export default defineConfig({
  testDir: "tests/e2e",
  use: {
    baseURL: previewUrl
  },
  webServer: {
    command: "pnpm preview",
    url: previewUrl,
    reuseExistingServer: true,
    stdout: "pipe",
    stderr: "pipe",
    timeout: 120000
  },
  expect: {
    timeout: 10000
  },
  reporter: "list",
  projects: [
    {
      name: "chromium",
      use: {
        browserName: "chromium"
      }
    }
  ],
  outputDir: "tmp/playwright",
  timeout: 30000,
  workers: 1
})
