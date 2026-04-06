import { Effect } from "effect"
import path from "node:path"
import yaml from "yaml"
import { generatedSiteDirectory, rootDirectory } from "../../core/paths.js"
import { Workspace, WorkspaceLive, type WorkspaceService } from "../../core/workspace.js"
import type { ProjectManifest } from "../schema.js"
import type { ProjectAdapter, ProjectCard } from "../types.js"

type ProblemRecord = {
  readonly name: string
  readonly url: string
  readonly difficulty: string
  readonly categories?: ReadonlyArray<string>
  readonly [key: string]: unknown
}

type ImplementationRecord = {
  readonly id: string
  readonly language: string
  readonly language_label: string
  readonly approach: string
  readonly approach_label: string
  readonly source_url: string
  readonly source_path: string | null
  readonly code: string
  readonly code_language: string
  readonly available: boolean
  readonly detail_url: string
}

type ImplementationDraft = Omit<ImplementationRecord, "detail_url">

type ProblemPageRecord = {
  readonly slug: string
  readonly name: string
  readonly url: string
  readonly difficulty: string
  readonly difficulty_slug: string
  readonly categories: ReadonlyArray<string>
  readonly languages: ReadonlyArray<{ readonly slug: string; readonly label: string; readonly count: number }>
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
  readonly languages: ReadonlyArray<{ readonly slug: string; readonly label: string; readonly count: number }>
  readonly implementation_count: number
  readonly detail_url: string
  readonly embed_url: string
  readonly search_title: string
}

type GeneratedProblemFile = {
  readonly path: string
  readonly content: string
}

type GeneratedProblemArtifacts = {
  readonly slug: string
  readonly page: ProblemPageRecord
  readonly view: ProblemViewRecord
  readonly files: ReadonlyArray<GeneratedProblemFile>
  readonly categories: ReadonlyArray<string>
  readonly languages: ReadonlyArray<string>
}

const languageMeta = {
  java: { label: "Java", code: "java" },
  scala: { label: "Scala", code: "scala" },
  cpp: { label: "C++", code: "cpp" },
  python: { label: "Python", code: "python" }
} as const

const languageOrder = ["java", "scala", "cpp", "python"] as const

const reservedProblemKeys = new Set(["name", "url", "difficulty", "categories"])

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

const frontMatter = (manifest: ProjectManifest, slug: string, title: string, embed: boolean) => {
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

const buildImplementation = (
  workspace: WorkspaceService,
  sourceRoot: string,
  language: string,
  approach: string,
  githubUrl: string
) =>
  Effect.gen(function* () {
    const meta = languageMeta[language as keyof typeof languageMeta] ?? { label: humanLabel(language), code: language }
    const sourcePath = localSourcePath(sourceRoot, githubUrl)
    const code = sourcePath && (yield* workspace.fileExists(sourcePath)) ? yield* workspace.readText(sourcePath) : ""

    return {
      id: slugify(`${language}-${approach}`),
      language,
      language_label: meta.label,
      approach,
      approach_label: humanLabel(approach),
      source_url: githubUrl,
      source_path: sourcePath ? path.relative(rootDirectory, sourcePath) : null,
      code,
      code_language: meta.code,
      available: code.length > 0
    } satisfies ImplementationDraft
  })

const buildProblemArtifacts = (
  workspace: WorkspaceService,
  manifest: ProjectManifest,
  sourceRoot: string,
  slug: string,
  rawProblem: ProblemRecord
) =>
  Effect.gen(function* () {
    const implementations: Array<ImplementationRecord> = []

    for (const [key, value] of Object.entries(rawProblem)) {
      if (reservedProblemKeys.has(key)) {
        continue
      }

      if (typeof value !== "object" || value === null) {
        continue
      }

      for (const [approach, githubUrl] of Object.entries(value as Record<string, string>)) {
        const implementation = yield* buildImplementation(workspace, sourceRoot, key, approach, githubUrl)
        implementations.push({
          ...implementation,
          detail_url: `${manifest.route_base}/problems/${slug}/?implementation=${implementation.id}`
        })
      }
    }

    const implementationsByLanguage = new Map<string, Array<ImplementationRecord>>()
    implementations.forEach((implementation) => {
      const list = implementationsByLanguage.get(implementation.language) ?? []
      implementationsByLanguage.set(implementation.language, [...list, implementation])
    })

    const languages = languageOrder
      .filter((language) => implementationsByLanguage.has(language))
      .map((language) => ({
        slug: language,
        label: languageMeta[language].label,
        count: implementationsByLanguage.get(language)?.length ?? 0
      }))

    const categories = rawProblem.categories ?? []
    const page: ProblemPageRecord = {
      slug,
      name: rawProblem.name,
      url: rawProblem.url,
      difficulty: rawProblem.difficulty,
      difficulty_slug: rawProblem.difficulty.toLowerCase(),
      categories,
      languages,
      implementations,
      implementation_count: implementations.length,
      detail_url: `${manifest.route_base}/problems/${slug}/`,
      embed_url: `${manifest.route_base}/problems/${slug}/embed/`
    }

    const view: ProblemViewRecord = {
      ...page,
      search_title: rawProblem.name.toLowerCase()
    }

    return {
      slug,
      page,
      view,
      categories,
      languages: languages.map((language) => language.slug),
      files: [
        {
          path: path.join(generatedSiteDirectory, manifest.slug, "problems", slug, "index.md"),
          content: frontMatter(manifest, slug, rawProblem.name, false)
        },
        {
          path: path.join(generatedSiteDirectory, manifest.slug, "problems", slug, "embed", "index.md"),
          content: frontMatter(manifest, slug, rawProblem.name, true)
        }
      ]
    } satisfies GeneratedProblemArtifacts
  })

const buildEureka = (manifest: ProjectManifest) =>
  Effect.gen(function* () {
    const workspace = yield* Workspace
    const sourceRoot = path.join(rootDirectory, manifest.source_repo_path)
    const problemsRaw = yield* workspace.readText(path.join(sourceRoot, "_data/problems.yml"))
    const parsed = yaml.parse(problemsRaw) as { problems?: Record<string, ProblemRecord> }
    const sourceUrl = yield* workspace.runGit(sourceRoot, "remote", "get-url", "origin")
    const problems = parsed.problems ?? {}

    const card: ProjectCard = {
      slug: manifest.slug,
      title: manifest.title,
      description: manifest.description,
      url: `${manifest.route_base}/`,
      source_url: sourceUrl.replace(/\.git$/, "")
    }

    const artifacts = yield* Effect.forEach(Object.entries(problems), ([slug, rawProblem]) =>
      buildProblemArtifacts(workspace, manifest, sourceRoot, slug, rawProblem)
    )

    const problemPages = Object.fromEntries(artifacts.map((artifact) => [artifact.slug, artifact.page]))
    const problemsView = artifacts.map((artifact) => artifact.view)
    const categories = new Set<string>()
    const languagesSeen = new Set<string>()

    artifacts.forEach((artifact) => {
      artifact.categories.forEach((category) => categories.add(category))
      artifact.languages.forEach((language) => languagesSeen.add(language))
    })

    yield* Effect.forEach(artifacts.flatMap((artifact) => artifact.files), (file) => workspace.writeText(file.path, file.content))
    yield* workspace.writeText(path.join(generatedSiteDirectory, `_data/generated/${manifest.slug}/problem_pages.yml`), yaml.stringify(problemPages))
    yield* workspace.writeText(path.join(generatedSiteDirectory, `_data/generated/${manifest.slug}/problems_view.yml`), yaml.stringify(problemsView))
    yield* workspace.writeText(path.join(generatedSiteDirectory, `_data/generated/${manifest.slug}/problem_filters.yml`), yaml.stringify({
      difficulties: ["Easy", "Medium", "Hard"],
      categories: Array.from(categories),
      languages: languageOrder.filter((language) => languagesSeen.has(language)).map((language) => ({
        slug: language,
        label: languageMeta[language].label
      }))
    }))

    return card
  })

export const eurekaProjectAdapter: ProjectAdapter = {
  kind: "eureka",
  build: (manifest) => buildEureka(manifest).pipe(Effect.provide(WorkspaceLive))
}
