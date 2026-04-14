import { Effect } from "effect"
import type { CodeReferencesPanel } from "../../../../packages/graph/src/index.js"
import { encodeFrontMatter } from "../../core/frontmatter.js"
import { generatedCollectionFile } from "../../core/jekyll.js"
import type { ProjectManifest } from "../schema.js"
import type { GeneratedTextFile } from "../types.js"
import type { ProblemPageRecord, SourceLanguage } from "./schema.js"
import { buildProblemRecords } from "./problem-records.js"
import type { ProblemSourceRecord } from "./source.js"

export type ProblemArtifacts = {
  readonly slug: string
  readonly page: ProblemPageRecord
  readonly files: ReadonlyArray<GeneratedTextFile>
}

const problemFrontMatter = (
  context: string,
  page: ProblemPageRecord,
  projectKey: string,
  implementationId?: string
) =>
  encodeFrontMatter(context, {
    title: page.title,
    description: `${page.title} solutions`,
    project_key: projectKey,
    problem_slug: page.problem_slug,
    problem_source_url: page.problem_source_url,
    difficulty: page.difficulty,
    difficulty_slug: page.difficulty_slug,
    categories: page.categories,
    languages: page.languages,
    implementations: page.implementations,
    implementation_count: page.implementation_count,
    detail_url: page.detail_url,
    embed_url: page.embed_url,
    search_title: page.search_title,
    ...(implementationId !== undefined ? { implementation_id: implementationId } : {})
  })

export const languageFrontMatter = (manifest: ProjectManifest, languageSlug: string, language: SourceLanguage) =>
  encodeFrontMatter(`Unable to encode language front matter for '${languageSlug}'`, {
    title: `${language.label} Solutions`,
    description: `All LeetCode solutions in ${language.label}.`,
    permalink: `${manifest.route_base}/${languageSlug}/`,
    language_filter: languageSlug
  })

export const buildProblemArtifacts = (
  manifest: ProjectManifest,
  languageEntries: ReadonlyArray<readonly [string, SourceLanguage]>,
  slug: string,
  problem: ProblemSourceRecord,
  codes: Readonly<Record<string, string>>,
  referencePanels: Readonly<Record<string, CodeReferencesPanel | null>>
): Effect.Effect<ProblemArtifacts, Error> =>
  Effect.gen(function* () {
    const { page } = buildProblemRecords(manifest, languageEntries, slug, problem, codes, referencePanels)
    const embedFiles = yield* Effect.forEach(page.implementations, (implementation) =>
      problemFrontMatter(
        `Unable to encode problem front matter for '${slug}' implementation '${implementation.id}'`,
        page,
        manifest.slug,
        implementation.id
      ).pipe(
        Effect.map((frontMatter) => ({
          path: generatedCollectionFile("problem_embeds", manifest.slug, "problems", slug, "embed", `${implementation.id}.md`),
          content: frontMatter
        } satisfies GeneratedTextFile))
      )
    )

    return {
      slug,
      page,
      files: [
        {
          path: generatedCollectionFile("problems", manifest.slug, "problems", `${slug}.md`),
          content: yield* problemFrontMatter(
            `Unable to encode problem front matter for '${slug}'`,
            page,
            manifest.slug
          )
        },
        {
          path: generatedCollectionFile("problem_embeds", manifest.slug, "problems", slug, "embed.md"),
          content: yield* problemFrontMatter(
            `Unable to encode problem embed front matter for '${slug}'`,
            page,
            manifest.slug,
            ""
          )
        },
        ...embedFiles
      ]
    }
  })
