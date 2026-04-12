import { Effect } from "effect"
import path from "node:path"
import type { GraphWorkspaceInput } from "../../graph/model.js"
import { buildCodeReferencePanels } from "../../graph/service.js"
import { encodeYaml } from "../../core/yaml.js"
import { generatedSiteDirectory, rootDirectory } from "../../core/paths.js"
import { FileStore, GitClient } from "../../core/workspace.js"
import type { ProjectManifest } from "../schema.js"
import type { GeneratedTextFile, ProjectAdapter, ProjectBuild, ProjectCard } from "../types.js"
import { buildEurekaModel, decodeEurekaSource, type EurekaSource } from "./model.js"
import { ProblemFiltersSchema, ProblemPagesSchema, ProblemsViewSchema } from "./schema.js"

type EurekaGraphDocument = {
  readonly key: string
  readonly languageSlug: string
  readonly sourceUrl: string
  readonly title: string
  readonly detailUrl: string
  readonly workspaceRoot: string
  readonly workspaceRelativePath: string
}

const localSourcePath = (sourceRoot: string, githubUrl: string): string | null => {
  const match = githubUrl.match(/^https:\/\/github\.com\/[^/]+\/([^/]+)\/blob\/[^/]+\/(.+)$/)
  if (!match) {
    return null
  }

  return path.join(sourceRoot, match[1], match[2])
}

const normalizeRemoteUrl = (remoteUrl: string) => {
  if (remoteUrl.startsWith("git@github.com:")) {
    return `https://github.com/${remoteUrl.slice("git@github.com:".length).replace(/\.git$/, "")}`
  }

  return remoteUrl.replace(/\.git$/, "")
}

const slugify = (value: string) => value.toLowerCase().replace(/[^a-z0-9_-]/g, "-")
const toPosixPath = (value: string) => value.split(path.sep).join("/")

const resolveGitMetadata = (repoRoot: string) =>
  Effect.gen(function* () {
    const gitClient = yield* GitClient
    const sourceUrl = yield* gitClient.runGit(repoRoot, "remote", "get-url", "origin").pipe(
      Effect.map(normalizeRemoteUrl),
      Effect.catchAll(() => Effect.succeed(""))
    )
    const branch = yield* gitClient.runGit(repoRoot, "rev-parse", "--abbrev-ref", "HEAD").pipe(
      Effect.catchAll(() => Effect.succeed("master"))
    )

    return { branch, sourceUrl }
  })

const eurekaWorkspaceConfig = (sourceRoot: string, languageSlug: string) => {
  switch (languageSlug) {
    case "java":
      return {
        rootPath: path.join(sourceRoot, "eureka-java"),
        kind: "scip-java" as const,
        primaryLanguage: "java",
        sourceExtensions: [".java"]
      }
    case "scala":
      return {
        rootPath: path.join(sourceRoot, "eureka-scala"),
        kind: "scip-java" as const,
        primaryLanguage: "scala",
        sourceExtensions: [".scala"]
      }
    case "python":
      return {
        rootPath: path.join(sourceRoot, "eureka-python"),
        kind: "scip-python" as const,
        primaryLanguage: "python",
        sourceExtensions: [".py"]
      }
    case "cpp":
      return {
        rootPath: path.join(sourceRoot, "eureka-cpp"),
        kind: "scip-clang" as const,
        primaryLanguage: "cpp",
        sourceExtensions: [".cpp", ".h", ".hpp"]
      }
    default:
      return null
  }
}

const buildEurekaReferencePanels = (
  manifest: ProjectManifest,
  sourceRoot: string,
  source: EurekaSource
) =>
  Effect.gen(function* () {
    const fileStore = yield* FileStore
    const documents: Array<EurekaGraphDocument> = []

    for (const [problemSlug, problem] of Object.entries(source.problems)) {
      for (const [languageSlug, implementations] of Object.entries(problem.implementations)) {
        const workspace = eurekaWorkspaceConfig(sourceRoot, languageSlug)
        if (!workspace) {
          continue
        }

        for (const [approach, sourceUrl] of Object.entries(implementations)) {
          const sourcePath = localSourcePath(sourceRoot, sourceUrl)
          if (!sourcePath || !(yield* fileStore.fileExists(sourcePath))) {
            continue
          }

          documents.push({
            key: `${languageSlug}:${approach}:${sourceUrl}`,
            languageSlug,
            sourceUrl,
            title: path.basename(sourcePath),
            detailUrl: `${manifest.route_base}/problems/${problemSlug}/?language=${languageSlug}&implementation=${slugify(`${languageSlug}-${approach}`)}`,
            workspaceRoot: workspace.rootPath,
            workspaceRelativePath: toPosixPath(path.relative(workspace.rootPath, sourcePath))
          })
        }
      }
    }

    const groupedDocuments = new Map<string, Array<EurekaGraphDocument>>()
    documents.forEach((document) => {
      const bucket = groupedDocuments.get(document.workspaceRoot) ?? []
      bucket.push(document)
      groupedDocuments.set(document.workspaceRoot, bucket)
    })

    const workspaceMetadataEntries = yield* Effect.forEach(Array.from(groupedDocuments.keys()), (workspaceRoot) =>
      resolveGitMetadata(workspaceRoot).pipe(
        Effect.map((metadata) => [workspaceRoot, metadata] as const)
      )
    )
    const workspaceMetadata = new Map(workspaceMetadataEntries)

    const workspaces: Array<GraphWorkspaceInput> = Array.from(groupedDocuments.entries()).flatMap(([workspaceRoot, workspaceDocuments]) => {
      const firstDocument = workspaceDocuments[0]
      if (!firstDocument) {
        return []
      }

      const workspaceConfig = eurekaWorkspaceConfig(sourceRoot, firstDocument.languageSlug)
      if (!workspaceConfig) {
        return []
      }

      const metadata = workspaceMetadata.get(workspaceRoot) ?? { branch: "master", sourceUrl: "" }
      const documentsByRelativePath = new Map(
        workspaceDocuments.map((document) => [document.workspaceRelativePath, document] as const)
      )

      return [{
        project_slug: manifest.slug,
        workspace_slug: path.basename(workspaceRoot),
        root_path: workspaceRoot,
        kind: workspaceConfig.kind,
        primary_language: workspaceConfig.primaryLanguage,
        source_extensions: workspaceConfig.sourceExtensions,
        documents: workspaceDocuments.map((document) => ({
          id: document.key,
          workspace_relative_path: document.workspaceRelativePath,
          title: document.title,
          language: workspaceConfig.primaryLanguage
        })),
        resolve_file: (workspaceRelativePath) => {
          const implementationDocument = documentsByRelativePath.get(workspaceRelativePath)
          if (implementationDocument) {
            return {
              title: implementationDocument.title,
              language: workspaceConfig.primaryLanguage,
              url: implementationDocument.detailUrl,
              url_kind: "internal" as const,
              description: workspaceRelativePath
            }
          }

          if (!metadata.sourceUrl) {
            return {
              title: path.basename(workspaceRelativePath),
              language: workspaceConfig.primaryLanguage,
              url: "",
              url_kind: "none" as const,
              description: workspaceRelativePath
            }
          }

          return {
            title: path.basename(workspaceRelativePath),
            language: workspaceConfig.primaryLanguage,
            url: `${metadata.sourceUrl}/blob/${metadata.branch}/${workspaceRelativePath}`,
            url_kind: "external" as const,
            description: workspaceRelativePath
          }
        }
      } satisfies GraphWorkspaceInput]
    })

    return yield* buildCodeReferencePanels(workspaces)
  })

const makeYamlFile = <A>(filePath: string, context: string, schema: any, value: A) =>
  encodeYaml(context, schema, value).pipe(
    Effect.map((content) => ({
      path: filePath,
      content
    } satisfies GeneratedTextFile))
  )

const buildCard = (manifest: ProjectManifest, sourceUrl: string): ProjectCard => ({
  slug: manifest.slug,
  title: manifest.title,
  description: manifest.description,
  url: `${manifest.route_base}/`,
  source_url: sourceUrl.replace(/\.git$/, "")
})

const buildEureka = (manifest: ProjectManifest) =>
  Effect.gen(function* () {
    const fileStore = yield* FileStore
    const gitClient = yield* GitClient
    const sourceRoot = path.join(rootDirectory, manifest.source_repo_path)
    const sourceRaw = yield* fileStore.readText(path.join(sourceRoot, "_data/problems.yml"))
    const source = yield* decodeEurekaSource(sourceRaw)
    const sourceUrl = yield* gitClient.runGit(sourceRoot, "remote", "get-url", "origin")
    const referencePanels = yield* buildEurekaReferencePanels(manifest, sourceRoot, source)
    const model = yield* buildEurekaModel(manifest, source, (githubUrl) => {
      const sourcePath = localSourcePath(sourceRoot, githubUrl)
      if (!sourcePath) {
        return Effect.succeed("")
      }

      return fileStore.fileExists(sourcePath).pipe(
        Effect.flatMap((exists) => exists ? fileStore.readText(sourcePath) : Effect.succeed(""))
      )
    }, (githubUrl, languageSlug, approach) => referencePanels.get(`${languageSlug}:${approach}:${githubUrl}`) ?? null)

    const dataFiles = yield* Effect.all([
      makeYamlFile(
        path.join(generatedSiteDirectory, `_data/generated/${manifest.slug}/problem_pages.yml`),
        `Unable to encode generated problem pages for '${manifest.slug}'`,
        ProblemPagesSchema,
        model.problemPages
      ),
      makeYamlFile(
        path.join(generatedSiteDirectory, `_data/generated/${manifest.slug}/problems_view.yml`),
        `Unable to encode generated problems view for '${manifest.slug}'`,
        ProblemsViewSchema,
        model.problemsView
      ),
      makeYamlFile(
        path.join(generatedSiteDirectory, `_data/generated/${manifest.slug}/problem_filters.yml`),
        `Unable to encode generated problem filters for '${manifest.slug}'`,
        ProblemFiltersSchema,
        model.problemFilters
      )
    ])

    return {
      card: buildCard(manifest, sourceUrl),
      files: [...model.files, ...dataFiles],
      assets: []
    } satisfies ProjectBuild
  })

export const eurekaProjectAdapter: ProjectAdapter = {
  kind: "eureka",
  build: buildEureka
}
