import { Effect } from "effect"
import path from "node:path"
import type { LanguageGraphExtractor } from "./graph-model.js"
import { readFilesRecursively, runCommandOrFail } from "./graph-model.js"

type ParsedMetapDocument = {
  readonly uri: string
  readonly declarations: ReadonlyArray<string>
  readonly references: ReadonlyArray<string>
}

const toPosixPath = (value: string) => value.replaceAll("\\", "/")

const isTopLevelTypeDeclaration = (description: string) => {
  const normalized = description.trim().toLowerCase()
  return normalized.startsWith("class ") ||
    normalized.startsWith("trait ") ||
    normalized.startsWith("object ") ||
    normalized.startsWith("enum ") ||
    normalized.startsWith("case class ") ||
    normalized.startsWith("case object ")
}

const parseMetapOutput = (output: string): ReadonlyArray<ParsedMetapDocument> => {
  const lines = output.split("\n")
  const documents: Array<ParsedMetapDocument> = []

  let currentUri: string | null = null
  let mode: "none" | "symbols" | "occurrences" = "none"
  let declarations: Array<string> = []
  let references: Array<string> = []

  const flush = () => {
    if (!currentUri) {
      return
    }

    documents.push({
      uri: currentUri,
      declarations,
      references
    })
    currentUri = null
    mode = "none"
    declarations = []
    references = []
  }

  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (!line) {
      continue
    }

    if (/^src\/main\/scala\/.+\.scala$/.test(line)) {
      flush()
      currentUri = line
      continue
    }

    if (!currentUri) {
      continue
    }

    if (line === "Symbols:") {
      mode = "symbols"
      continue
    }

    if (line === "Occurrences:") {
      mode = "occurrences"
      continue
    }

    if (line === "Synthetics:") {
      mode = "none"
      continue
    }

    if (mode === "symbols") {
      const match = line.match(/^([^\s]+)\s*=>\s*(.+)$/)
      if (!match) {
        continue
      }

      const symbol = match[1].trim()
      const description = match[2].trim()
      if (isTopLevelTypeDeclaration(description)) {
        declarations.push(symbol)
      }
      continue
    }

    if (mode === "occurrences") {
      const match = line.match(/^\[[^\]]+\)\s*=>\s*([^\s]+)$/)
      if (!match) {
        continue
      }
      references.push(match[1].trim())
    }
  }

  flush()
  return documents
}

export const ScalaLanguageGraphExtractor: LanguageGraphExtractor = {
  language: "scala",
  extractModuleEdges: (context) =>
    Effect.gen(function* () {
      const scalaDocuments = context.module.documents.filter((document) =>
        document.format === "code" && document.language === "scala"
      )
      if (scalaDocuments.length === 0) {
        return []
      }

      yield* runCommandOrFail(
        context.projectSlug,
        "scala-graph-compile",
        context.module.absolutePath,
        "sbt",
        ["graphCompile"]
      )

      const semanticDbRoot = path.join(context.module.absolutePath, "target/semanticdb")
      const semanticDbFiles = yield* readFilesRecursively(context.projectSlug, semanticDbRoot, ".semanticdb")
      if (semanticDbFiles.length === 0) {
        return []
      }

      const parsedDocuments: Array<ParsedMetapDocument> = []
      const chunkSize = 120
      for (let index = 0; index < semanticDbFiles.length; index += chunkSize) {
        const chunk = semanticDbFiles.slice(index, index + chunkSize)
        const metapOutput = yield* runCommandOrFail(
          context.projectSlug,
          "scala-metap",
          context.repoRoot,
          "cs",
          ["launch", "metap", "--", ...chunk]
        )
        parsedDocuments.push(...parseMetapOutput(metapOutput))
      }

      const sourcePathBySymbol = new Map<string, Set<string>>()
      const referencesBySourcePath = new Map<string, Set<string>>()

      for (const parsed of parsedDocuments) {
        const sourcePath = toPosixPath(path.relative(context.repoRoot, path.join(context.module.absolutePath, parsed.uri)))
        if (!scalaDocuments.some((document) => document.source_path === sourcePath)) {
          continue
        }

        parsed.declarations.forEach((symbol) => {
          const existing = sourcePathBySymbol.get(symbol) ?? new Set<string>()
          existing.add(sourcePath)
          sourcePathBySymbol.set(symbol, existing)
        })

        const references = referencesBySourcePath.get(sourcePath) ?? new Set<string>()
        parsed.references.forEach((symbol) => references.add(symbol))
        referencesBySourcePath.set(sourcePath, references)
      }

      const edges = new Set<string>()
      for (const [sourcePath, references] of referencesBySourcePath.entries()) {
        for (const symbol of references) {
          const targetPaths = sourcePathBySymbol.get(symbol)
          if (!targetPaths || targetPaths.size === 0) {
            continue
          }

          for (const targetPath of targetPaths) {
            if (targetPath === sourcePath) {
              continue
            }
            edges.add(`${sourcePath}|${targetPath}`)
          }
        }
      }

      return Array.from(edges).map((entry) => {
        const [source_path, target_path] = entry.split("|")
        return { source_path, target_path }
      })
    })
}
