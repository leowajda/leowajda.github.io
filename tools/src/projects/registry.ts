import { Context, Layer } from "effect"
import { projectDefinitions } from "./catalog.js"
import type { ProjectAdapter } from "./types.js"

export class ProjectAdapterRegistry extends Context.Tag("ProjectAdapterRegistry")<
  ProjectAdapterRegistry,
  { readonly adapters: Readonly<Record<string, ProjectAdapter>> }
>() {}

export const ProjectAdapterRegistryLive = Layer.succeed(ProjectAdapterRegistry, {
  adapters: Object.fromEntries(projectDefinitions.map(({ adapter }) => [adapter.kind, adapter])) as Readonly<Record<string, ProjectAdapter>>
})
