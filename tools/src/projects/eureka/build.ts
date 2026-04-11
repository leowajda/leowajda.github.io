import { Effect, ParseResult, Schema } from "effect"
import path from "node:path"
import yaml from "yaml"
import { generatedSiteDirectory, rootDirectory } from "../../core/paths.js"
import { Workspace, type WorkspaceService } from "../../core/workspace.js"
import type { ProjectManifest } from "../schema.js"
import type { ProjectAdapter, ProjectCard } from "../types.js"

const EurekaLanguageSchema = Schema.Struct({
  label: Schema.String,
  code_language: Schema.String
})

const ProblemMetadataSchema = Schema.Struct({
  name: Schema.String,
  url: Schema.String,
  difficulty: Schema.String,
  categories: Schema.Array(Schema.String)
})

const RawProblemSchema = Schema.Record({ key: Schema.String, value: Schema.Unknown })
const ImplementationSourcesSchema = Schema.Record({ key: Schema.String, value: Schema.String })
const EurekaSourceSchema = Schema.Struct({
  languages: Schema.Record({ key: Schema.String, value: EurekaLanguageSchema }),
  problems: Schema.Record({ key: Schema.String, value: RawProblemSchema })
})

type SourceLanguage = Schema.Schema.Type<typeof EurekaLanguageSchema>
type ProblemMetadata = Schema.Schema.Type<typeof ProblemMetadataSchema>
type RawProblemRecord = Schema.Schema.Type<typeof RawProblemSchema>
type ImplementationSources = Schema.Schema.Type<typeof ImplementationSourcesSchema>
type EurekaSourceRecord = Schema.Schema.Type<typeof EurekaSourceSchema>

type ProblemSourceRecord = ProblemMetadata & {
  readonly implementations: Readonly<Record<string, ImplementationSources>>
}

type LanguageSummary = {
  readonly slug: string
  readonly label: string
  readonly count: number
}

type ImplementationRecord = {
  readonly id: string
  readonly language: string
  readonly approach: string
  readonly approach_label: string
  readonly source_url: string
  readonly code: string
  readonly code_language: string
  readonly detail_url: string
}

type ProblemPageRecord = {
  readonly slug: string
  readonly name: string
  readonly url: string
  readonly difficulty: string
  readonly difficulty_slug: string
  readonly categories: ReadonlyArray<string>
  readonly languages: ReadonlyArray<LanguageSummary>
  readonly implementations: ReadonlyArray<ImplementationRecord>
  readonly implementation_count: number
  readonly detail_url: string
  readonly embed_url: string
}

type ProblemViewRecord = {
  readonly slug: string
  readonly name: string
  readonly url: string
  readonly difficulty: string
  readonly difficulty_slug: string
  readonly categories: ReadonlyArray<string>
  readonly languages: ReadonlyArray<LanguageSummary>
  readonly implementation_count: number
  readonly detail_url: string
  readonly embed_url: string
  readonly search_title: string
}

type GeneratedFile = {
  readonly path: string
  readonly content: string
}

type GeneratedProblemArtifacts = {
  readonly slug: string
  readonly page: ProblemPageRecord
  readonly view: ProblemViewRecord
  readonly files: ReadonlyArray<GeneratedFile>
  readonly categories: ReadonlyArray<string>
  readonly difficulties: ReadonlyArray<string>
}

type EurekaSource = {
  readonly languages: Readonly<Record<string, SourceLanguage>>
  readonly problems: Readonly<Record<string, ProblemSourceRecord>>
}

const metadataKeys = new Set(["name", "url", "difficulty", "categories"])

const formatSchemaError = (context: string) => (error: ParseResult.ParseError) =>
  new Error(`${context}\n${ParseResult.TreeFormatter.formatErrorSync(error)}`)

const decodeYaml = <A>(context: string, raw: string, schema: Schema.Schema<A, any, never>) =>
  Effect.try({
    try: () => yaml.parse(raw),
    catch: (error) => new Error(`${context}: unable to parse YAML: ${String(error)}`)
  }).pipe(
    Effect.flatMap((value) =>
      Schema.decodeUnknown(schema)(value).pipe(Effect.mapError(formatSchemaError(context)))
    )
  )

const localSourcePath = (sourceRoot: string, githubUrl: string): string | null => {
  const match = githubUrl.match(/^https:\/\/github\.com\/[^/]+\/([^/]+)\/blob\/[^/]+\/(.+)$/)
  if (!match) {
    return null
  }

  return path.join(sourceRoot, match[1], match[2])
}

const humanLabel = (value: string) =>
  value
    .replace(/_/g, " ")
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")

const slugify = (value: string) => value.toLowerCase().replace(/[^a-z0-9_-]/g, "-")

const problemFrontMatter = (manifest: ProjectManifest, slug: string, title: string, embed: boolean) => {
  const payload = {
    layout: embed ? "problem_embed" : "problem",
    title,
    description: `${title} solutions`,
    problem_slug: slug,
    project_key: manifest.slug,
    permalink: embed ? `${manifest.route_base}/problems/${slug}/embed/` : `${manifest.route_base}/problems/${slug}/`,
    body_class: embed ? "" : "page-wide"
  }

  return `---\n${yaml.stringify(payload)}---\n`
}

const languageFrontMatter = (manifest: ProjectManifest, languageSlug: string, language: SourceLanguage) => {
  const payload = {
    layout: "problems",
    title: `${language.label} Solutions`,
    description: `All LeetCode solutions in ${language.label}.`,
    permalink: `${manifest.route_base}/${languageSlug}/`,
    body_class: "page-wide",
    project_key: manifest.slug,
    language_filter: languageSlug
  }

  return `---\n${yaml.stringify(payload)}---\n`
}

const decodeProblem = (
  slug: string,
  rawProblem: RawProblemRecord,
  languages: Readonly<Record<string, SourceLanguage>>
) =>
  Effect.gen(function* () {
    const unknownKeys = Object.keys(rawProblem).filter((key) => !metadataKeys.has(key) && !(key in languages))
    if (unknownKeys.length > 0) {
      return yield* Effect.fail(new Error(`Problem '${slug}' references unsupported keys: ${unknownKeys.join(", ")}`))
    }

    const metadata = yield* Schema.decodeUnknown(ProblemMetadataSchema)(rawProblem).pipe(
      Effect.mapError(formatSchemaError(`Invalid problem metadata for '${slug}'`))
    )

    const implementations = Object.fromEntries(
      (
        yield* Effect.forEach(Object.keys(languages), (language) => {
          const rawImplementations = rawProblem[language]
          if (rawImplementations === undefined) {
            return Effect.succeed(null)
          }

          return Schema.decodeUnknown(ImplementationSourcesSchema)(rawImplementations).pipe(
            Effect.map((value) => [language, value] as const),
            Effect.mapError(formatSchemaError(`Invalid implementations for '${slug}' in '${language}'`))
          )
        })
      ).filter((entry): entry is readonly [string, ImplementationSources] => entry !== null)
    )

    if (!Object.keys(implementations).length) {
      return yield* Effect.fail(new Error(`Problem '${slug}' has no implementations`))
    }

    return {
      ...metadata,
      implementations
    } satisfies ProblemSourceRecord
  })

const decodeEurekaSource = (raw: string) =>
  decodeYaml("Unable to decode Eureka problem table", raw, EurekaSourceSchema).pipe(
    Effect.flatMap((source) =>
      Effect.forEach(Object.entries(source.problems), ([slug, rawProblem]) =>
        decodeProblem(slug, rawProblem, source.languages).pipe(Effect.map((problem) => [slug, problem] as const))
      ).pipe(
        Effect.map((problems) => ({
          languages: source.languages,
          problems: Object.fromEntries(problems)
        } satisfies EurekaSource))
      )
    )
  )

const buildImplementation = (
  workspace: WorkspaceService,
  sourceRoot: string,
  manifest: ProjectManifest,
  problemSlug: string,
  languageSlug: string,
  language: SourceLanguage,
  approach: string,
  githubUrl: string
) =>
  Effect.gen(function* () {
    const sourcePath = localSourcePath(sourceRoot, githubUrl)
    const code = sourcePath && (yield* workspace.fileExists(sourcePath)) ? yield* workspace.readText(sourcePath) : ""
    const implementationId = slugify(`${languageSlug}-${approach}`)

    return {
      id: implementationId,
      language: languageSlug,
      approach,
      approach_label: humanLabel(approach),
      source_url: githubUrl,
      code,
      code_language: language.code_language,
      detail_url: `${manifest.route_base}/problems/${problemSlug}/?language=${languageSlug}&implementation=${implementationId}`
    } satisfies ImplementationRecord
  })

const buildProblemArtifacts = (
  workspace: WorkspaceService,
  manifest: ProjectManifest,
  sourceRoot: string,
  languageEntries: ReadonlyArray<readonly [string, SourceLanguage]>,
  slug: string,
  problem: ProblemSourceRecord
) =>
  Effect.gen(function* () {
    const implementations = (
      yield* Effect.forEach(languageEntries, ([languageSlug, language]) => {
        const sources = problem.implementations[languageSlug]
        if (!sources) {
          return Effect.succeed([] as Array<ImplementationRecord>)
        }

        return Effect.forEach(Object.entries(sources), ([approach, githubUrl]) =>
          buildImplementation(workspace, sourceRoot, manifest, slug, languageSlug, language, approach, githubUrl)
        )
      })
    ).flat()

    const implementationsByLanguage = new Map<string, Array<ImplementationRecord>>()
    implementations.forEach((implementation) => {
      const list = implementationsByLanguage.get(implementation.language) ?? []
      list.push(implementation)
      implementationsByLanguage.set(implementation.language, list)
    })

    const languages = languageEntries
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
      categories: problem.categories,
      difficulties: [problem.difficulty],
      files: [
        {
          path: path.join(generatedSiteDirectory, manifest.slug, "problems", slug, "index.md"),
          content: problemFrontMatter(manifest, slug, problem.name, false)
        },
        {
          path: path.join(generatedSiteDirectory, manifest.slug, "problems", slug, "embed", "index.md"),
          content: problemFrontMatter(manifest, slug, problem.name, true)
        }
      ]
    } satisfies GeneratedProblemArtifacts
  })

const buildEureka = (manifest: ProjectManifest) =>
  Effect.gen(function* () {
    const workspace = yield* Workspace
    const sourceRoot = path.join(rootDirectory, manifest.source_repo_path)
    const sourceRaw = yield* workspace.readText(path.join(sourceRoot, "_data/problems.yml"))
    const source = yield* decodeEurekaSource(sourceRaw)
    const sourceUrl = yield* workspace.runGit(sourceRoot, "remote", "get-url", "origin")
    const languageEntries = Object.entries(source.languages)

    const card: ProjectCard = {
      slug: manifest.slug,
      title: manifest.title,
      description: manifest.description,
      url: `${manifest.route_base}/`,
      source_url: sourceUrl.replace(/\.git$/, "")
    }

    const artifacts = yield* Effect.forEach(Object.entries(source.problems), ([slug, problem]) =>
      buildProblemArtifacts(workspace, manifest, sourceRoot, languageEntries, slug, problem)
    )

    const problemPages = Object.fromEntries(artifacts.map((artifact) => [artifact.slug, artifact.page]))
    const problemsView = artifacts.map((artifact) => artifact.view)
    const categories = new Set<string>()
    const difficulties = new Set<string>()

    artifacts.forEach((artifact) => {
      artifact.categories.forEach((category) => categories.add(category))
      artifact.difficulties.forEach((difficulty) => difficulties.add(difficulty))
    })

    const generatedFiles = [
      ...artifacts.flatMap((artifact) => artifact.files),
      ...languageEntries.map(([languageSlug, language]) => ({
        path: path.join(generatedSiteDirectory, manifest.slug, languageSlug, "index.md"),
        content: languageFrontMatter(manifest, languageSlug, language)
      }))
    ]

    yield* Effect.forEach(generatedFiles, (file) => workspace.writeText(file.path, file.content))
    yield* workspace.writeText(path.join(generatedSiteDirectory, `_data/generated/${manifest.slug}/problem_pages.yml`), yaml.stringify(problemPages))
    yield* workspace.writeText(path.join(generatedSiteDirectory, `_data/generated/${manifest.slug}/problems_view.yml`), yaml.stringify(problemsView))
    yield* workspace.writeText(path.join(generatedSiteDirectory, `_data/generated/${manifest.slug}/problem_filters.yml`), yaml.stringify({
      difficulties: Array.from(difficulties),
      categories: Array.from(categories),
      languages: languageEntries.map(([slug, language]) => ({
        slug,
        label: language.label
      }))
    }))

    return card
  })

export const eurekaProjectAdapter: ProjectAdapter = {
  kind: "eureka",
  build: buildEureka
}
