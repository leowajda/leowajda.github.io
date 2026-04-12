import { Effect } from "effect"
import path from "node:path"
import { FileStore } from "../../core/workspace.js"
import type { ProjectManifest } from "../schema.js"
import { buildSourceDocument, type BuiltSourceDocument } from "./documents.js"
import {
  slugifyModuleName,
  walkTextFiles,
  type ModuleCandidate
} from "./discovery.js"

const textFileMetadata: Readonly<Record<string, { readonly format: "code" | "markdown"; readonly syntax: string; readonly language: string }>> = {
  ".conf": { format: "code", syntax: "conf", language: "config" },
  ".gradle": { format: "code", syntax: "groovy", language: "groovy" },
  ".java": { format: "code", syntax: "java", language: "java" },
  ".json": { format: "code", syntax: "json", language: "json" },
  ".kts": { format: "code", syntax: "kotlin", language: "kotlin" },
  ".md": { format: "markdown", syntax: "", language: "markdown" },
  ".properties": { format: "code", syntax: "properties", language: "properties" },
  ".scala": { format: "code", syntax: "scala", language: "scala" },
  ".sc": { format: "code", syntax: "scala", language: "scala" },
  ".sbt": { format: "code", syntax: "scala", language: "scala" },
  ".sql": { format: "code", syntax: "sql", language: "sql" },
  ".txt": { format: "markdown", syntax: "", language: "text" },
  ".xml": { format: "code", syntax: "xml", language: "xml" },
  ".yaml": { format: "code", syntax: "yaml", language: "yaml" },
  ".yml": { format: "code", syntax: "yaml", language: "yaml" }
}

const supportedTextExtensions = new Set(Object.keys(textFileMetadata))

type GitMetadata = {
  readonly branch: string
  readonly sourceUrl: string
}

export const buildModuleDocuments = (
  manifest: ProjectManifest,
  moduleCandidate: ModuleCandidate,
  repoRoot: string,
  gitMetadata: GitMetadata
): Effect.Effect<ReadonlyArray<BuiltSourceDocument>, Error, FileStore> =>
  Effect.gen(function* () {
    const fileStore = yield* FileStore

    return yield* Effect.forEach(moduleCandidate.roots, (root) =>
      walkTextFiles(root.absolutePath, supportedTextExtensions).pipe(
        Effect.flatMap((files) =>
          Effect.forEach(files, (filePath) =>
            fileStore.readText(filePath).pipe(
              Effect.flatMap((content) =>
                buildSourceDocument(
                  {
                    manifest,
                    moduleSlug: moduleCandidate.slug,
                    moduleTitle: moduleCandidate.title,
                    repoRoot,
                    rootLabel: root.label,
                    defaultLanguage: root.language,
                    filePath,
                    rootAbsolutePath: root.absolutePath,
                    gitBranch: gitMetadata.branch,
                    gitSourceUrl: gitMetadata.sourceUrl,
                    metadata: textFileMetadata[path.extname(filePath).toLowerCase()],
                    slugify: slugifyModuleName
                  },
                  content
                )
              )
            )
          , { concurrency: 8 })
        )
      )
    , { concurrency: 4 }).pipe(
      Effect.map((documents) => documents.flat())
    )
  })
