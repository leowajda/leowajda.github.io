import { Effect } from "effect"
import path from "node:path"
import type { CodeReferencesPanel } from "../../../../packages/graph/src/index.js"
import { generatedSiteDirectory } from "../../core/paths.js"
import { encodeFrontMatter } from "../../core/frontmatter.js"
import type { ProjectManifest } from "../schema.js"
import type { GeneratedTextFile } from "../types.js"
import type {
  LanguageSummary,
  ProblemPageRecord,
  ProblemViewRecord,
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
  readonly code_references: CodeReferencesPanel | null
}

export type ProblemArtifacts = {
  readonly slug: string
  readonly page: ProblemPageRecord
  readonly view: ProblemViewRecord
  readonly files: ReadonlyArray<GeneratedTextFile>
}

type ProblemImplementationSource = {
  readonly languageSlug: string
  readonly language: SourceLanguage
  readonly approach: string
  readonly sourceUrl: string
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

const problemFrontMatter = (manifest: ProjectManifest, slug: string, title: string, embed: boolean) =>
  encodeFrontMatter(`Unable to encode problem front matter for '${slug}'`, {
    layout: embed ? "problem_embed" : "problem",
    title,
    description: `${title} solutions`,
    problem_slug: slug,
    project_key: manifest.slug,
    permalink: embed ? `${manifest.route_base}/problems/${slug}/embed/` : `${manifest.route_base}/problems/${slug}/`,
    body_class: embed ? "" : "page-wide"
  })

export const languageFrontMatter = (manifest: ProjectManifest, languageSlug: string, language: SourceLanguage) =>
  encodeFrontMatter(`Unable to encode language front matter for '${languageSlug}'`, {
    layout: "problems",
    title: `${language.label} Solutions`,
    description: `All LeetCode solutions in ${language.label}.`,
    permalink: `${manifest.route_base}/${languageSlug}/`,
    body_class: "page-wide",
    project_key: manifest.slug,
    language_filter: languageSlug
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
    detail_url: `${manifest.route_base}/problems/${problemSlug}/?language=${languageSlug}&implementation=${implementationId}`,
    code_references: codeReferences
  }
}

export const buildProblemArtifacts = (
  manifest: ProjectManifest,
  languageEntries: ReadonlyArray<readonly [string, SourceLanguage]>,
  slug: string,
  problem: ProblemSourceRecord,
  codes: Readonly<Record<string, string>>,
  referencePanels: Readonly<Record<string, CodeReferencesPanel | null>>
): Effect.Effect<ProblemArtifacts, Error> =>
  Effect.gen(function* () {
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
      slug,
      name: problem.name,
      url: problem.url,
      difficulty: problem.difficulty,
      difficulty_slug: slugify(problem.difficulty),
      categories: problem.categories,
      languages,
      implementations,
      implementation_count: implementations.length,
      detail_url: `${manifest.route_base}/problems/${slug}/`,
      embed_url: `${manifest.route_base}/problems/${slug}/embed/`
    }

    const view: ProblemViewRecord = {
      ...page,
      search_title: problem.name.toLowerCase()
    }

    return {
      slug,
      page,
      view,
      files: [
        {
          path: path.join(generatedSiteDirectory, manifest.slug, "problems", slug, "index.md"),
          content: yield* problemFrontMatter(manifest, slug, problem.name, false)
        },
        {
          path: path.join(generatedSiteDirectory, manifest.slug, "problems", slug, "embed", "index.md"),
          content: yield* problemFrontMatter(manifest, slug, problem.name, true)
        }
      ]
    }
  })
