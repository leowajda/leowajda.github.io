import { Effect } from "effect"
import type { Workspace } from "../core/workspace.js"
import type { ProjectManifest } from "./schema.js"

export type ProjectCard = {
  slug: string
  title: string
  description: string
  url: string
  source_url: string
}

export type ProjectAdapter = {
  readonly kind: string
  readonly build: (manifest: ProjectManifest) => Effect.Effect<ProjectCard, Error, Workspace>
}
