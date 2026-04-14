import type { CodeReferencesPanel } from "../../../../packages/graph/src/index.js"
import type { ProjectManifest } from "../schema.js"
import type {
  LanguageSummary,
  ProblemPageRecord,
  SourceLanguage
} from "./schema.js"
import type { ProblemSourceRecord } from "./source.js"

type BuiltImplementation = {
  readonly id: string
  readonly language: string
  readonly approach: string
  readonly approach_label: string
  readonly source_url: string
  readonly code: string
  readonly code_language: string
  readonly detail_url: string
  readonly embed_url: string
  readonly code_references: CodeReferencesPanel | null
}

type ProblemImplementationSource = {
  readonly languageSlug: string
  readonly language: SourceLanguage
  readonly approach: string
  readonly sourceUrl: string
}

type ProblemRecords = {
  readonly page: ProblemPageRecord
}

const humanLabel = (value: string) =>
  value
    .replace(/_/g, " ")
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")

const slugify = (value: string) => value.toLowerCase().replace(/[^a-z0-9_-]/g, "-")

export const implementationKey = (languageSlug: string, approach: string, sourceUrl: string) =>
  `${languageSlug}:${approach}:${sourceUrl}`

export const listProblemImplementations = (
  languageEntries: ReadonlyArray<readonly [string, SourceLanguage]>,
  problem: ProblemSourceRecord
): ReadonlyArray<ProblemImplementationSource> =>
  languageEntries.flatMap(([languageSlug, language]) => {
    const sources = problem.implementations[languageSlug]
    if (!sources) {
      return []
    }

    return Object.entries(sources).map(([approach, sourceUrl]) => ({
      languageSlug,
      language,
      approach,
      sourceUrl
    }))
  })

const buildImplementation = (
  manifest: ProjectManifest,
  problemSlug: string,
  languageSlug: string,
  language: SourceLanguage,
  approach: string,
  sourceUrl: string,
  code: string,
  codeReferences: CodeReferencesPanel | null
): BuiltImplementation => {
  const implementationId = slugify(`${languageSlug}-${approach}`)

  return {
    id: implementationId,
    language: languageSlug,
    approach,
    approach_label: humanLabel(approach),
    source_url: sourceUrl,
    code,
    code_language: language.code_language,
    detail_url: `${manifest.route_base}/problems/${problemSlug}/#${implementationId}`,
    embed_url: `${manifest.route_base}/problems/${problemSlug}/embed/${implementationId}/`,
    code_references: codeReferences
  }
}

export const buildProblemRecords = (
  manifest: ProjectManifest,
  languageEntries: ReadonlyArray<readonly [string, SourceLanguage]>,
  slug: string,
  problem: ProblemSourceRecord,
  codes: Readonly<Record<string, string>>,
  referencePanels: Readonly<Record<string, CodeReferencesPanel | null>>
): ProblemRecords => {
  const implementations = listProblemImplementations(languageEntries, problem).map(
    ({ languageSlug, language, approach, sourceUrl }) =>
      buildImplementation(
        manifest,
        slug,
        languageSlug,
        language,
        approach,
        sourceUrl,
        codes[implementationKey(languageSlug, approach, sourceUrl)] ?? "",
        referencePanels[implementationKey(languageSlug, approach, sourceUrl)] ?? null
      )
  )

  const implementationsByLanguage = new Map<string, Array<BuiltImplementation>>()
  implementations.forEach((implementation) => {
    const list = implementationsByLanguage.get(implementation.language) ?? []
    list.push(implementation)
    implementationsByLanguage.set(implementation.language, list)
  })

  const languages: Array<LanguageSummary> = languageEntries
    .filter(([languageSlug]) => implementationsByLanguage.has(languageSlug))
    .map(([languageSlug, language]) => ({
      slug: languageSlug,
      label: language.label,
      count: implementationsByLanguage.get(languageSlug)?.length ?? 0
    }))

  const page: ProblemPageRecord = {
    problem_slug: slug,
    title: problem.name,
    problem_source_url: problem.url,
    difficulty: problem.difficulty,
    difficulty_slug: slugify(problem.difficulty),
    categories: problem.categories,
    languages,
    implementations,
    implementation_count: implementations.length,
    detail_url: `${manifest.route_base}/problems/${slug}/`,
    embed_url: `${manifest.route_base}/problems/${slug}/embed/`,
    search_title: problem.name.toLowerCase()
  }

  return {
    page
  }
}
