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
  records.forEach(validateRecord)
  return records
}

const assertFlatStringMap = (record, field) => {
  const value = record[field]
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new TypeError(`Search record ${record.url || "<unknown>"}.${field} must be a flat object`)
  }

  for (const [key, entry] of Object.entries(value)) {
    if (typeof key !== "string" || typeof entry !== "string") {
      throw new TypeError(`Search record ${record.url || "<unknown>"}.${field}.${key} must be a string`)
    }
  }
}

const assertFilterMap = (record) => {
  const { filters } = record
  if (!filters || typeof filters !== "object" || Array.isArray(filters)) {
    throw new TypeError(`Search record ${record.url || "<unknown>"}.filters must be a flat object`)
  }

  for (const [key, values] of Object.entries(filters)) {
    if (!Array.isArray(values) || values.some((value) => typeof value !== "string")) {
      throw new TypeError(`Search record ${record.url || "<unknown>"}.filters.${key} must be an array of strings`)
    }
  }
}

const validateRecord = (record) => {
  for (const field of ["url", "content", "language"]) {
    if (typeof record[field] !== "string" || record[field].length === 0) {
      throw new TypeError(`Search record ${record.url || "<unknown>"}.${field} must be a non-empty string`)
    }
  }

  assertFlatStringMap(record, "meta")
  assertFilterMap(record)
  assertFlatStringMap(record, "sort")
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
