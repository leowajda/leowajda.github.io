import { Context, Layer } from "effect"
import { eurekaProjectAdapter } from "./eureka.js"
import type { ProjectAdapter } from "./types.js"

export class ProjectAdapterRegistry extends Context.Tag("ProjectAdapterRegistry")<
  ProjectAdapterRegistry,
  { readonly adapters: Readonly<Record<string, ProjectAdapter>> }
>() {}

export const ProjectAdapterRegistryLive = Layer.succeed(ProjectAdapterRegistry, {
  adapters: {
    [eurekaProjectAdapter.kind]: eurekaProjectAdapter
  }
})
