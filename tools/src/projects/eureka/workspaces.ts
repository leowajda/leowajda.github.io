import { Effect } from "effect"
import path from "node:path"
import type { GraphWorkspaceInput } from "../../graph/model.js"
import { toPosixPath } from "../../core/repository.js"
import { FileStore } from "../../core/workspace.js"
import type { ProjectManifest } from "../schema.js"
import type { EurekaSource } from "./source.js"

export type EurekaGraphDocument = {
  readonly key: string
  readonly languageSlug: string
  readonly title: string
  readonly detailUrl: string
  readonly workspaceRoot: string
  readonly workspaceRelativePath: string
}

type EurekaWorkspaceConfig = {
  readonly rootPath: string
  readonly kind: GraphWorkspaceInput["kind"]
  readonly primaryLanguage: string
  readonly sourceExtensions: ReadonlyArray<string>
}

type RepositoryMetadata = {
  readonly branch: string
  readonly sourceUrl: string
}

export const localSourcePath = (sourceRoot: string, githubUrl: string): string | null => {
  const match = githubUrl.match(/^https:\/\/github\.com\/[^/]+\/([^/]+)\/blob\/[^/]+\/(.+)$/)
  if (!match) {
    return null
  }

  return path.join(sourceRoot, match[1], match[2])
}

const implementationSlug = (languageSlug: string, approach: string) =>
  `${languageSlug}-${approach}`.toLowerCase().replace(/[^a-z0-9_-]/g, "-")

const eurekaWorkspaceConfig = (sourceRoot: string, languageSlug: string): EurekaWorkspaceConfig | null => {
  switch (languageSlug) {
    case "java":
      return {
        rootPath: path.join(sourceRoot, "eureka-java"),
        kind: "scip-java",
        primaryLanguage: "java",
        sourceExtensions: [".java"]
      }
    case "scala":
      return {
        rootPath: path.join(sourceRoot, "eureka-scala"),
        kind: "scip-java",
        primaryLanguage: "scala",
        sourceExtensions: [".scala"]
      }
    case "python":
      return {
        rootPath: path.join(sourceRoot, "eureka-python"),
        kind: "scip-python",
        primaryLanguage: "python",
        sourceExtensions: [".py"]
      }
    case "cpp":
      return {
        rootPath: path.join(sourceRoot, "eureka-cpp"),
        kind: "scip-clang",
        primaryLanguage: "cpp",
        sourceExtensions: [".cpp", ".h", ".hpp"]
      }
    default:
      return null
  }
}

export const collectEurekaGraphDocuments = (
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
            title: path.basename(sourcePath),
            detailUrl: `${manifest.route_base}/problems/${problemSlug}/#${implementationSlug(languageSlug, approach)}`,
            workspaceRoot: workspace.rootPath,
            workspaceRelativePath: toPosixPath(path.relative(workspace.rootPath, sourcePath))
          })
        }
      }
    }

    return documents as ReadonlyArray<EurekaGraphDocument>
  })

const groupDocumentsByWorkspace = (documents: ReadonlyArray<EurekaGraphDocument>) => {
  const groupedDocuments = new Map<string, Array<EurekaGraphDocument>>()

  documents.forEach((document) => {
    const bucket = groupedDocuments.get(document.workspaceRoot) ?? []
    bucket.push(document)
    groupedDocuments.set(document.workspaceRoot, bucket)
  })

  return groupedDocuments
}

export const buildEurekaGraphWorkspaces = (
  manifestSlug: string,
  sourceRoot: string,
  documents: ReadonlyArray<EurekaGraphDocument>,
  workspaceMetadata: ReadonlyMap<string, RepositoryMetadata>
): ReadonlyArray<GraphWorkspaceInput> =>
  Array.from(groupDocumentsByWorkspace(documents).entries()).flatMap(([workspaceRoot, workspaceDocuments]) => {
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
      project_slug: manifestSlug,
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
