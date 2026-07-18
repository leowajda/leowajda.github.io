import fs from "node:fs/promises"
import path from "node:path"
import process from "node:process"

const sitePath = path.resolve(process.env.PAGEFIND_SITE || "_site")
const indexPath = path.join(sitePath, "pagefind")
const entryPath = path.join(indexPath, "pagefind-entry.json")
const requiredFiles = [
  "pagefind.js",
  "pagefind-worker.js",
  "pagefind-entry.json"
]

const exists = async (targetPath) => {
  try {
    await fs.access(targetPath)
    return true
  } catch {
    return false
  }
}

const readJson = async (targetPath) =>
  JSON.parse(await fs.readFile(targetPath, "utf8"))

const assertFile = async (relativePath) => {
  const targetPath = path.join(indexPath, relativePath)
  if (!(await exists(targetPath))) {
    throw new Error(`Missing Pagefind asset: ${path.relative(process.cwd(), targetPath)}`)
  }
}

const languageAssets = (entry) =>
  Object.values(entry.languages || {}).flatMap((metadata) => {
    const hash = metadata.hash
    const wasm = metadata.wasm || "unknown"

    return [
      `pagefind.${hash}.pf_meta`,
      `wasm.${wasm}.pagefind`
    ]
  })

const pageCount = (entry) =>
  Object.values(entry.languages || {}).reduce((total, metadata) => total + Number(metadata.page_count || 0), 0)

const run = async () => {
  for (const requiredFile of requiredFiles) {
    await assertFile(requiredFile)
  }

  const entry = await readJson(entryPath)
  const indexedPages = pageCount(entry)

  for (const asset of languageAssets(entry)) {
    await assertFile(asset)
  }

  if (indexedPages <= 0) {
    throw new Error("Pagefind index contains no pages")
  }

  console.log(`Pagefind index verified with ${indexedPages} records.`)
}

run().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
