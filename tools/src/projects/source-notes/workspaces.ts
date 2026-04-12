import { Effect } from "effect"
import path from "node:path"
import { toPosixPath } from "../../core/repository.js"
import { FileStore } from "../../core/workspace.js"
import type { GraphWorkspaceInput } from "../../graph/model.js"
import type { SourceNotesDocument } from "./schema.js"

export type ModuleGraphInput = {
  readonly modulePath: string
  readonly moduleSlug: string
  readonly documents: ReadonlyArray<SourceNotesDocument>
}

type WorkspaceDocument = {
  readonly document: SourceNotesDocument
  readonly sourcePath: string
}

const gradleWorkspaceRootMarkers = ["gradlew", "settings.gradle", "settings.gradle.kts"] as const
const gradleWorkspaceMarkers = ["build.gradle", "build.gradle.kts"] as const
const scalaWorkspaceMarkers = ["build.sbt"] as const

const hasWorkspaceMarker = (directory: string, markers: ReadonlyArray<string>) =>
  Effect.gen(function* () {
    const fileStore = yield* FileStore

    for (const marker of markers) {
      if (yield* fileStore.fileExists(path.join(directory, marker))) {
        return true
      }
    }

    return false
  })

const resolveModuleWorkspaceRoot = (repoRoot: string, modulePath: string) =>
  Effect.gen(function* () {
    const ancestors: Array<string> = []
    let cursor = modulePath

    while (true) {
      ancestors.push(cursor)
      if (cursor === repoRoot) {
        break
      }

      const parent = path.dirname(cursor)
      if (parent === cursor) {
        break
      }

      cursor = parent
    }

    for (const ancestor of [...ancestors].reverse()) {
      if (yield* hasWorkspaceMarker(ancestor, gradleWorkspaceRootMarkers)) {
        return ancestor
      }
    }

    for (const ancestor of ancestors) {
      if (yield* hasWorkspaceMarker(ancestor, gradleWorkspaceMarkers)) {
        return ancestor
      }
    }

    for (const ancestor of ancestors) {
      if (yield* hasWorkspaceMarker(ancestor, scalaWorkspaceMarkers)) {
        return ancestor
      }
    }

    return modulePath
  })

const languageSourceExtensions = (languages: ReadonlySet<string>) => {
  const extensions = new Set<string>()

  languages.forEach((language) => {
    switch (language) {
      case "java":
        extensions.add(".java")
        break
      case "scala":
        extensions.add(".scala")
        extensions.add(".sc")
        break
    }
  })

  return Array.from(extensions)
}

const groupCodeDocumentsByWorkspace = (
  repoRoot: string,
  builtModules: ReadonlyArray<ModuleGraphInput>,
  workspaceRootByModule: ReadonlyMap<string, string>
) => {
  const groupedDocuments = new Map<string, Array<WorkspaceDocument>>()

  builtModules.forEach((module) => {
    const workspaceRoot = workspaceRootByModule.get(module.moduleSlug) ?? module.modulePath
    const bucket = groupedDocuments.get(workspaceRoot) ?? []

    module.documents
      .filter((document) => document.format === "code")
      .forEach((document) => {
        bucket.push({
          document,
          sourcePath: path.join(repoRoot, document.source_path)
        })
      })

    groupedDocuments.set(workspaceRoot, bucket)
  })

  return groupedDocuments
}

export const buildGraphWorkspaceInputs = (
  manifestSlug: string,
  repoRoot: string,
  builtModules: ReadonlyArray<ModuleGraphInput>,
  workspaceRootByModule: ReadonlyMap<string, string>
): ReadonlyArray<GraphWorkspaceInput> =>
  Array.from(groupCodeDocumentsByWorkspace(repoRoot, builtModules, workspaceRootByModule).entries())
    .filter(([, documents]) => documents.length > 0)
    .map(([workspaceRoot, documents]) => {
      const workspaceRelativeRoot = toPosixPath(path.relative(repoRoot, workspaceRoot))
      const documentsByRelativePath = new Map(
        documents.map(({ document, sourcePath }) => [
          toPosixPath(path.relative(workspaceRoot, sourcePath)),
          document
        ] as const)
      )
      const languages = new Set(documents.map(({ document }) => document.language))

      return {
        project_slug: manifestSlug,
        workspace_slug: workspaceRelativeRoot || "root",
        root_path: workspaceRoot,
        kind: "scip-java",
        primary_language: documents[0]?.document.language ?? "java",
        source_extensions: languageSourceExtensions(languages),
        documents: documents.map(({ document, sourcePath }) => ({
          id: document.id,
          workspace_relative_path: toPosixPath(path.relative(workspaceRoot, sourcePath)),
          title: document.title,
          language: document.language
        })),
        resolve_file: (workspaceRelativePath) => {
          const document = documentsByRelativePath.get(workspaceRelativePath)
          if (!document) {
            return null
          }

          return {
            title: document.title,
            language: document.language,
            url: document.url,
            url_kind: "internal" as const,
            description: document.source_path
          }
        }
      } satisfies GraphWorkspaceInput
    })

export const resolveWorkspaceRootByModule = (
  repoRoot: string,
  builtModules: ReadonlyArray<ModuleGraphInput>
) =>
  Effect.forEach(builtModules, (module) =>
    resolveModuleWorkspaceRoot(repoRoot, module.modulePath).pipe(
      Effect.map((workspaceRoot) => [module.moduleSlug, workspaceRoot] as const)
    )
  ).pipe(
    Effect.map((entries) => new Map(entries) as ReadonlyMap<string, string>)
  )
