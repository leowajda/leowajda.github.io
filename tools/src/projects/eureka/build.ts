import { Effect } from "effect"
import path from "node:path"
import { encodeYaml } from "../../core/yaml.js"
import { generatedDataFile } from "../../core/jekyll.js"
import { rootDirectory } from "../../core/paths.js"
import { FileStore } from "../../core/workspace.js"
import { resolveRepositoryMetadata } from "../../core/repository.js"
import type { ProjectManifest } from "../schema.js"
import type { GeneratedTextFile, ProjectAdapter, ProjectBuild, ProjectCard } from "../types.js"
import { buildEurekaModel, decodeEurekaSource } from "./model.js"
import { buildEurekaReferencePanels } from "./references.js"
import { ProblemFiltersSchema } from "./schema.js"
import { localSourcePath } from "./workspaces.js"

const slugify = (value: string) => value.toLowerCase().replace(/[^a-z0-9_-]/g, "-")

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
    const sourceRoot = path.join(rootDirectory, manifest.source_repo_path)
    const sourceRaw = yield* fileStore.readText(path.join(sourceRoot, "_data/problems.yml"))
    const source = yield* decodeEurekaSource(sourceRaw)
    const sourceMetadata = yield* resolveRepositoryMetadata(sourceRoot)
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
        generatedDataFile(manifest.slug, "problem_filters.yml"),
        `Unable to encode generated problem filters for '${manifest.slug}'`,
        ProblemFiltersSchema,
        model.problemFilters
      )
    ])

    return {
      card: buildCard(manifest, sourceMetadata.sourceUrl),
      files: [...model.files, ...dataFiles],
      assets: []
    } satisfies ProjectBuild
  })

export const eurekaProjectAdapter: ProjectAdapter = {
  kind: "eureka",
  build: buildEureka
}
