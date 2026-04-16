import { defineConfig } from "@playwright/test"

const previewUrl = "http://127.0.0.1:4173"

export default defineConfig({
  testDir: "tests/e2e",
  use: {
    baseURL: previewUrl
  },
  webServer: {
    command: "bundle exec jekyll serve --source site-src --destination _site --host 127.0.0.1 --port 4173 --livereload --livereload-port 35730",
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
