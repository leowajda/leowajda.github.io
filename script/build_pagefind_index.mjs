import fs from "node:fs/promises"
import path from "node:path"
import process from "node:process"
import * as pagefind from "pagefind"

const sitePath = path.resolve(process.env.PAGEFIND_SITE || "_site")
const extrasPath = path.resolve(process.env.PAGEFIND_EXTRAS || "tmp/pagefind-extras.json")
const outputPath = path.join(sitePath, "pagefind")

const ensureNoErrors = (context, errors = []) => {
  if (errors.length === 0) {
    return
  }

  throw new Error(`${context} failed:\n${errors.map((error) => `  - ${error}`).join("\n")}`)
}

const readExtras = async () => {
  try {
    const raw = await fs.readFile(extrasPath, "utf8")
    const records = JSON.parse(raw)
    if (!Array.isArray(records)) {
      throw new TypeError(`${extrasPath} must contain an array`)
    }
    return records
  } catch (error) {
    if (error && error.code === "ENOENT") {
      return []
    }
    throw error
  }
}

const run = async () => {
  const extras = await readExtras()
  const { index } = await pagefind.createIndex({
    forceLanguage: "en",
    includeCharacters: "_-+/+#."
  })

  const directoryResult = await index.addDirectory({ path: sitePath })
  ensureNoErrors(`Indexing ${sitePath}`, directoryResult.errors)

  for (const record of extras) {
    const { errors } = await index.addCustomRecord(record)
    ensureNoErrors(`Indexing extra ${record.url}`, errors)
  }

  const { errors } = await index.writeFiles({ outputPath })
  ensureNoErrors("Writing Pagefind index", errors)
  await pagefind.close()

  console.log(
    `Indexed site HTML from ${sitePath} plus ${extras.length} extras into ${outputPath}.`
  )
}

run().catch(async (error) => {
  await pagefind.close().catch(() => {})
  console.error(error)
  process.exitCode = 1
})
