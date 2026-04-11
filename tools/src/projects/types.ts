import { Effect, Schema } from "effect"
import type { CommandRunner, FileStore, GitClient } from "../core/workspace.js"
import type { ProjectManifest } from "./schema.js"

export const ProjectCardSchema = Schema.Struct({
  slug: Schema.String,
  title: Schema.String,
  description: Schema.String,
  url: Schema.String,
  source_url: Schema.String
})

export const GeneratedTextFileSchema = Schema.Struct({
  path: Schema.String,
  content: Schema.String
})

export const GeneratedAssetFileSchema = Schema.Struct({
  source_path: Schema.String,
  target_path: Schema.String
})

export const ProjectBuildSchema = Schema.Struct({
  card: ProjectCardSchema,
  files: Schema.Array(GeneratedTextFileSchema),
  assets: Schema.Array(GeneratedAssetFileSchema)
})

export type ProjectCard = Schema.Schema.Type<typeof ProjectCardSchema>
export type GeneratedTextFile = Schema.Schema.Type<typeof GeneratedTextFileSchema>
export type GeneratedAssetFile = Schema.Schema.Type<typeof GeneratedAssetFileSchema>
export type ProjectBuild = Schema.Schema.Type<typeof ProjectBuildSchema>

export type ProjectAdapter = {
  readonly kind: string
  readonly build: (manifest: ProjectManifest) => Effect.Effect<ProjectBuild, Error, FileStore | GitClient | CommandRunner>
}
