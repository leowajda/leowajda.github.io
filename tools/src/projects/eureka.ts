import { Effect } from "effect"
import path from "node:path"
import yaml from "yaml"
import { generatedSiteDirectory, rootDirectory } from "../core/paths.js"
import { fileExists, readText, runGit, writeText } from "../core/io.js"
import type { ProjectManifest } from "./schema.js"
import type { ProjectAdapter, ProjectCard } from "./types.js"

type ProblemRecord = {
  name: string
  url: string
  difficulty: string
  categories?: ReadonlyArray<string>
  [key: string]: unknown
}

const languageMeta = {
  java: { label: "Java", code: "java" },
  scala: { label: "Scala", code: "scala" },
  cpp: { label: "C++", code: "cpp" },
  python: { label: "Python", code: "python" }
} as const

const languageOrder = ["java", "scala", "cpp", "python"] as const

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

const buildEureka = (manifest: ProjectManifest) =>
  Effect.gen(function* () {
    const sourceRoot = path.join(rootDirectory, manifest.source_repo_path)
    const problemsRaw = yield* readText(path.join(sourceRoot, "_data/problems.yml"))
    const parsed = yaml.parse(problemsRaw) as { problems?: Record<string, ProblemRecord> }
    const sourceUrl = yield* runGit(sourceRoot, "remote", "get-url", "origin")
    const problems = parsed.problems || {}

    const card: ProjectCard = {
      slug: manifest.slug,
      title: manifest.title,
      description: manifest.description,
      url: `${manifest.route_base}/`,
      source_url: sourceUrl.replace(/\.git$/, "")
    }

    const problemPages: Record<string, unknown> = {}
    const problemsView: Array<Record<string, unknown>> = []
    const categories = new Set<string>()
    const languagesSeen = new Set<string>()

    for (const [slug, rawProblem] of Object.entries(problems)) {
      const implementations: Array<Record<string, unknown>> = []

      for (const [language, languagePayload] of Object.entries(rawProblem)) {
        if (["name", "url", "difficulty", "categories"].includes(language)) {
          continue
        }

        if (typeof languagePayload !== "object" || languagePayload === null) {
          continue
        }

        const meta = languageMeta[language as keyof typeof languageMeta] ?? { label: humanLabel(language), code: language }

        for (const [approach, githubUrl] of Object.entries(languagePayload as Record<string, string>)) {
          const sourcePath = localSourcePath(sourceRoot, githubUrl)
          const code = sourcePath && (yield* fileExists(sourcePath)) ? yield* readText(sourcePath) : ""
          const implementationId = slugify(`${language}-${approach}`)

          implementations.push({
            id: implementationId,
            language,
            language_label: meta.label,
            approach,
            approach_label: humanLabel(approach),
            source_url: githubUrl,
            source_path: sourcePath ? path.relative(rootDirectory, sourcePath) : null,
            code,
            code_language: meta.code,
            available: code.length > 0,
            detail_url: `${manifest.route_base}/problems/${slug}/?implementation=${implementationId}`
          })
        }
      }

      const implementationsByLanguage = new Map<string, Array<Record<string, unknown>>>()
      implementations.forEach((implementation) => {
        const language = String(implementation.language)
        implementationsByLanguage.set(language, [...(implementationsByLanguage.get(language) ?? []), implementation])
      })

      const languages = languageOrder
        .filter((language) => implementationsByLanguage.has(language))
        .map((language) => ({
          slug: language,
          label: languageMeta[language].label,
          count: implementationsByLanguage.get(language)?.length ?? 0
        }))

      languages.forEach((language) => languagesSeen.add(language.slug))
      rawProblem.categories?.forEach((category) => categories.add(category))

      const page = {
        slug,
        name: rawProblem.name,
        url: rawProblem.url,
        difficulty: rawProblem.difficulty,
        difficulty_slug: rawProblem.difficulty.toLowerCase(),
        categories: rawProblem.categories ?? [],
        languages,
        implementations,
        implementation_count: implementations.length,
        detail_url: `${manifest.route_base}/problems/${slug}/`,
        embed_url: `${manifest.route_base}/problems/${slug}/embed/`
      }

      problemPages[slug] = page
      problemsView.push({
        slug,
        name: rawProblem.name,
        url: rawProblem.url,
        difficulty: rawProblem.difficulty,
        difficulty_slug: rawProblem.difficulty.toLowerCase(),
        categories: rawProblem.categories ?? [],
        languages,
        implementation_count: implementations.length,
        detail_url: `${manifest.route_base}/problems/${slug}/`,
        embed_url: `${manifest.route_base}/problems/${slug}/embed/`,
        search_name: rawProblem.name.toLowerCase()
      })

      yield* writeText(path.join(generatedSiteDirectory, manifest.slug, "problems", slug, "index.md"), frontMatter(manifest, slug, rawProblem.name, false))
      yield* writeText(path.join(generatedSiteDirectory, manifest.slug, "problems", slug, "embed", "index.md"), frontMatter(manifest, slug, rawProblem.name, true))
    }

    yield* writeText(path.join(generatedSiteDirectory, `_data/generated/${manifest.slug}/problem_pages.yml`), yaml.stringify(problemPages))
    yield* writeText(path.join(generatedSiteDirectory, `_data/generated/${manifest.slug}/problems_view.yml`), yaml.stringify(problemsView))
    yield* writeText(path.join(generatedSiteDirectory, `_data/generated/${manifest.slug}/problem_filters.yml`), yaml.stringify({
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
  build: buildEureka
}
