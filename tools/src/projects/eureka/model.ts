import { Effect } from "effect"
import path from "node:path"
import type { CodeReferencesPanel } from "../../../../packages/graph/src/index.js"
import { generatedSiteDirectory } from "../../core/paths.js"
import type { ProjectManifest } from "../schema.js"
import type { GeneratedTextFile } from "../types.js"
import {
  type ProblemPageRecord,
  type ProblemViewRecord,
  type SourceLanguage,
  type ProblemFilters
} from "./schema.js"
import { decodeEurekaSource, type EurekaSource, type ProblemSourceRecord } from "./source.js"
import {
  buildProblemArtifacts,
  implementationKey,
  languageFrontMatter,
  listProblemImplementations
} from "./artifacts.js"

export type EurekaBuildModel = {
  readonly files: ReadonlyArray<GeneratedTextFile>
  readonly problemPages: Readonly<Record<string, ProblemPageRecord>>
  readonly problemsView: ReadonlyArray<ProblemViewRecord>
  readonly problemFilters: ProblemFilters
}

export { decodeEurekaSource }
export type { EurekaSource, ProblemSourceRecord }

export const buildEurekaModel = (
  manifest: ProjectManifest,
  source: EurekaSource,
  loadCode: (sourceUrl: string) => Effect.Effect<string, Error>,
  resolveReferences?: (sourceUrl: string, languageSlug: string, approach: string) => CodeReferencesPanel | null
) =>
  Effect.gen(function* () {
    const languageEntries = Object.entries(source.languages)
    const problemEntries = Object.entries(source.problems)

    const codes = Object.fromEntries(
      (
        yield* Effect.forEach(problemEntries, ([, problem]) =>
          Effect.forEach(
            listProblemImplementations(languageEntries, problem),
            ({ languageSlug, approach, sourceUrl }) =>
              loadCode(sourceUrl).pipe(
                Effect.map((code) => [implementationKey(languageSlug, approach, sourceUrl), code] as const)
              ),
            { concurrency: 8 }
          )
        , { concurrency: 8 })
      ).flat()
    )

    const artifacts = yield* Effect.forEach(problemEntries, ([slug, problem]) =>
      buildProblemArtifacts(
        manifest,
        languageEntries,
        slug,
        problem,
        codes,
        Object.fromEntries(
          listProblemImplementations(languageEntries, problem).map(({ languageSlug, approach, sourceUrl }) => [
            implementationKey(languageSlug, approach, sourceUrl),
            resolveReferences?.(sourceUrl, languageSlug, approach) ?? null
          ] as const)
        )
      )
    )

    const problemPages = Object.fromEntries(artifacts.map((artifact) => [artifact.slug, artifact.page]))
    const problemsView = artifacts.map((artifact) => artifact.view)
    const categories = new Set<string>()
    const difficulties = new Set<string>()

    artifacts.forEach((artifact) => {
      artifact.page.categories.forEach((category) => categories.add(category))
      difficulties.add(artifact.page.difficulty)
    })

    const problemFilters: ProblemFilters = {
      difficulties: Array.from(difficulties),
      categories: Array.from(categories),
      languages: languageEntries.map(([slug, language]) => ({ slug, label: language.label }))
    }

    return {
      files: [
        ...artifacts.flatMap((artifact) => artifact.files),
        ...(yield* Effect.forEach(languageEntries, ([languageSlug, language]) =>
          languageFrontMatter(manifest, languageSlug, language).pipe(
            Effect.map((content) => ({
              path: path.join(generatedSiteDirectory, manifest.slug, languageSlug, "index.md"),
              content
            }))
          )
        ))
      ],
      problemPages,
      problemsView,
      problemFilters
    } satisfies EurekaBuildModel
  })
