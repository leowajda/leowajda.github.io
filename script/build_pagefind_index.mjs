import fs from "node:fs/promises"
import path from "node:path"
import process from "node:process"
import * as pagefind from "pagefind"

const sitePath = path.resolve(process.env.PAGEFIND_SITE || "_site")
const recordPath = path.resolve(process.env.PAGEFIND_RECORDS || "tmp/search-records.json")
const outputPath = path.join(sitePath, "pagefind")

const readRecords = async () => {
  const raw = await fs.readFile(recordPath, "utf8")
  const records = JSON.parse(raw)
  if (!Array.isArray(records)) {
    throw new TypeError(`${recordPath} must contain an array of search records`)
  }
  return records
}

const ensureNoErrors = (context, errors = []) => {
  if (errors.length === 0) {
    return
  }

  throw new Error(`${context} failed:\n${errors.map((error) => `  - ${error}`).join("\n")}`)
}

const run = async () => {
  const records = await readRecords()
  const { index } = await pagefind.createIndex({
    forceLanguage: "en",
    includeCharacters: "_-+/+#."
  })

  for (const record of records) {
    const { errors } = await index.addCustomRecord(record)
    ensureNoErrors(`Indexing ${record.url}`, errors)
  }

  const { errors } = await index.writeFiles({ outputPath })
  ensureNoErrors("Writing Pagefind index", errors)
  await pagefind.close()

  console.log(`Indexed ${records.length} records into ${outputPath}.`)
}

run().catch(async (error) => {
  await pagefind.close()
  console.error(error)
  process.exitCode = 1
})
