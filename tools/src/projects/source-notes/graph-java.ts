import { Effect } from "effect"
import path from "node:path"
import { SourceNotesError } from "../../core/errors.js"
import { generatedSiteDirectory } from "../../core/paths.js"
import { FileStore } from "../../core/workspace.js"
import type { LanguageGraphExtractor } from "./graph-model.js"
import { runCommandOrFail } from "./graph-model.js"

type DotEdge = {
  readonly from: string
  readonly to: string
}

const parseJdepsDot = (dot: string): ReadonlyArray<DotEdge> =>
  dot
    .split("\n")
    .map((line) => line.trim())
    .flatMap((line) => {
      const match = line.match(/^"([^"]+)"\s*->\s*"([^"]+)";$/)
      if (!match) {
        return []
      }

      const from = match[1].replace(/\s+\(.+\)$/, "").trim()
      const to = match[2].replace(/\s+\(.+\)$/, "").trim()
      if (!from || !to || from.includes(" ") || to.includes(" ")) {
        return []
      }

      return [{ from, to } satisfies DotEdge]
    })

const toJavaClassName = (sourcePath: string) => {
  const marker = "src/main/java/"
  const index = sourcePath.indexOf(marker)
  if (index < 0) {
    return ""
  }

  const withoutPrefix = sourcePath.slice(index + marker.length).replace(/\.java$/, "")
  return withoutPrefix.split("/").filter(Boolean).join(".")
}

const normalizeJavaClass = (name: string) =>
  name
    .replace(/\s+\(.+\)$/, "")
    .replace(/\[\]$/, "")
    .trim()

const resolveSourcePaths = (
  className: string,
  index: ReadonlyMap<string, ReadonlySet<string>>
): ReadonlySet<string> => {
  const normalized = normalizeJavaClass(className)
  const direct = index.get(normalized)
  if (direct && direct.size > 0) {
    return direct
  }

  const outer = normalized.includes("$") ? normalized.slice(0, normalized.indexOf("$")) : normalized
  return index.get(outer) ?? new Set<string>()
}

const buildGradleTask = (moduleRelativePath: string) => {
  const normalized = moduleRelativePath.trim()
  if (!normalized || normalized === ".") {
    return "graphClasses"
  }

  const segments = normalized.split("/").filter(Boolean)
  return `:${segments.join(":")}:graphClasses`
}

export const JavaLanguageGraphExtractor: LanguageGraphExtractor = {
  language: "java",
  extractModuleEdges: (context) =>
    Effect.gen(function* () {
      const fileStore = yield* FileStore
      const javaDocuments = context.module.documents.filter((document) =>
        document.format === "code" && document.language === "java"
      )
      if (javaDocuments.length === 0) {
        return []
      }

      const gradlewPath = path.join(context.repoRoot, "gradlew")
      const hasGradleWrapper = yield* fileStore.fileExists(gradlewPath)
      if (!hasGradleWrapper) {
        return yield* Effect.fail(new SourceNotesError({
          slug: context.projectSlug,
          phase: "java-gradle-wrapper",
          reason: `Missing '${gradlewPath}'`
        }))
      }

      const task = buildGradleTask(context.module.relativePath)
      yield* runCommandOrFail(
        context.projectSlug,
        "java-graph-compile",
        context.repoRoot,
        gradlewPath,
        [task, "--no-daemon"]
      )

      const classesDirectory = path.join(context.module.absolutePath, "build/classes/java/main")
      const classesExist = yield* fileStore.fileExists(classesDirectory)
      if (!classesExist) {
        return []
      }

      const dotDirectory = path.join(
        generatedSiteDirectory,
        "_tmp_graph",
        context.projectSlug,
        "jdeps",
        context.module.slug
      )
      yield* runCommandOrFail(
        context.projectSlug,
        "java-jdeps",
        context.module.absolutePath,
        "jdeps",
        [
          "-verbose:class",
          "--multi-release",
          "base",
          "--ignore-missing-deps",
          "--dot-output",
          dotDirectory,
          classesDirectory
        ]
      )

      const dotPath = path.join(dotDirectory, "main.dot")
      const dotExists = yield* fileStore.fileExists(dotPath)
      if (!dotExists) {
        return []
      }

      const dot = yield* fileStore.readText(dotPath).pipe(
        Effect.mapError((error) => new SourceNotesError({
          slug: context.projectSlug,
          phase: "java-jdeps-read",
          reason: String(error)
        }))
      )

      const classIndexMutable = new Map<string, Set<string>>()
      javaDocuments.forEach((document) => {
        const className = toJavaClassName(document.source_path)
        if (!className) {
          return
        }

        const existing = classIndexMutable.get(className) ?? new Set<string>()
        existing.add(document.source_path)
        classIndexMutable.set(className, existing)
      })

      const classIndex: ReadonlyMap<string, ReadonlySet<string>> = new Map(
        Array.from(classIndexMutable.entries()).map(([key, value]) => [key, new Set(value) as ReadonlySet<string>])
      )

      const edges = new Set<string>()
      for (const edge of parseJdepsDot(dot)) {
        const sourcePaths = resolveSourcePaths(edge.from, classIndex)
        const targetPaths = resolveSourcePaths(edge.to, classIndex)
        if (sourcePaths.size === 0 || targetPaths.size === 0) {
          continue
        }

        for (const sourcePath of sourcePaths) {
          for (const targetPath of targetPaths) {
            if (sourcePath === targetPath) {
              continue
            }
            edges.add(`${sourcePath}|${targetPath}`)
          }
        }
      }

      return Array.from(edges).map((entry) => {
        const [source_path, target_path] = entry.split("|")
        return { source_path, target_path }
      })
    })
}
