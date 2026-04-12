import { Effect } from "effect"
import path from "node:path"
import type { CodeReferencesPanel } from "../../../../packages/graph/src/index.js"
import { generatedSiteDirectory } from "../../core/paths.js"
import { encodeFrontMatter } from "../../core/frontmatter.js"
import type { ProjectManifest } from "../schema.js"
import type { GeneratedTextFile } from "../types.js"
import type { ProblemPageRecord, ProblemViewRecord, SourceLanguage } from "./schema.js"
import { buildProblemRecords } from "./problem-records.js"
import type { ProblemSourceRecord } from "./source.js"

export type ProblemArtifacts = {
  readonly slug: string
  readonly page: ProblemPageRecord
  readonly view: ProblemViewRecord
  readonly files: ReadonlyArray<GeneratedTextFile>
}

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

export const buildProblemArtifacts = (
  manifest: ProjectManifest,
  languageEntries: ReadonlyArray<readonly [string, SourceLanguage]>,
  slug: string,
  problem: ProblemSourceRecord,
  codes: Readonly<Record<string, string>>,
  referencePanels: Readonly<Record<string, CodeReferencesPanel | null>>
): Effect.Effect<ProblemArtifacts, Error> =>
  Effect.gen(function* () {
    const { page, view } = buildProblemRecords(manifest, languageEntries, slug, problem, codes, referencePanels)

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
