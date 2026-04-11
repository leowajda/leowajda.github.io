import { Effect, Schema } from "effect"
import { ArchitectureGraphError } from "../core/errors.js"
import type { ProjectManifest } from "../projects/schema.js"
import { ArchitectureConfigRepository } from "./config.js"
import { ArchitectureDiscovery, ProjectManifestRepository, type DiscoveredFile } from "./discovery.js"
import {
  ArchitectureGraphSchema,
  type ArchitectureEdge,
  type ArchitectureGraph,
  type ArchitectureModuleDefinition,
  type ArchitectureNode,
  type ModulePathMatchRule,
  type TopologyEdgeDefinition,
  type TopologyNodeDefinition
} from "./schema.js"

const dedupeBy = <A>(values: ReadonlyArray<A>, keyOf: (value: A) => string): ReadonlyArray<A> =>
  Array.from(new Map(values.map((value) => [keyOf(value), value])).values())

type ProjectVariables = {
  readonly slug: string
  readonly kind: string
  readonly title: string
  readonly description: string
  readonly route_base: string
  readonly source_repo_path: string
}

const projectVariables = (manifest: ProjectManifest): ProjectVariables => ({
  slug: manifest.slug,
  kind: manifest.kind,
  title: manifest.title,
  description: manifest.description,
  route_base: manifest.route_base,
  source_repo_path: manifest.source_repo_path
})

const interpolate = (template: string, variables: Record<string, string>) =>
  template.replace(/\$\{([^}]+)\}/g, (_, key: string) => variables[key] ?? "")

const matchesRule = (rule: ModulePathMatchRule, relativePath: string) => {
  switch (rule.kind) {
    case "exact":
      return relativePath === rule.value
    case "prefix":
    case "project_prefix":
      return relativePath.startsWith(rule.value)
  }
}

const resolveProjectManifest = (
  manifests: ReadonlyArray<ProjectVariables>,
  relativePath: string,
  prefix: string
) => {
  const projectSegment = relativePath.slice(prefix.length).split("/")[0]
  return manifests.find((manifest) => manifest.slug === projectSegment || manifest.kind === projectSegment)
}

const classifyTrackedPath = (
  relativePath: string,
  manifests: ReadonlyArray<ProjectVariables>,
  modules: ReadonlyArray<ArchitectureModuleDefinition>
): ArchitectureNode => {
  for (const module of modules) {
    for (const rule of module.match) {
      if (!matchesRule(rule, relativePath)) {
        continue
      }

      const project = rule.kind === "project_prefix" ? resolveProjectManifest(manifests, relativePath, rule.value) : undefined
      if (rule.kind === "project_prefix" && !project) {
        continue
      }

      const variables: Record<string, string> = project ?? {}
      return {
        id: interpolate(module.id, variables),
        label: interpolate(module.label, variables),
        group: module.group,
        detail: interpolate(module.detail, variables),
        origin: "discovered",
        project: project?.slug,
        role: module.role ? interpolate(module.role, variables) : undefined,
        tags: module.tags.map((tag) => interpolate(tag, variables))
      }
    }
  }

  return {
    id: "other",
    label: "other",
    group: "other",
    detail: "unclassified tracked files",
    origin: "discovered",
    tags: ["unclassified"]
  }
}

const toDeclaredNode = (definition: TopologyNodeDefinition): ArchitectureNode => ({
  id: definition.id,
  label: definition.label,
  group: definition.group,
  detail: definition.detail,
  origin: "declared",
  role: definition.role,
  tags: definition.tags
})

const toDeclaredEdge = (definition: TopologyEdgeDefinition): ArchitectureEdge => ({
  ...definition,
  origin: "declared"
})

const toProjectNode = (
  definition: TopologyNodeDefinition,
  variables: Record<string, string>
): ArchitectureNode => ({
  id: interpolate(definition.id, variables),
  label: interpolate(definition.label, variables),
  group: definition.group,
  detail: interpolate(definition.detail, variables),
  origin: "project",
  project: variables.slug,
  role: definition.role ? interpolate(definition.role, variables) : undefined,
  tags: definition.tags.map((tag) => interpolate(tag, variables))
})

const toProjectEdge = (
  definition: TopologyEdgeDefinition,
  variables: Record<string, string>
): ArchitectureEdge => ({
  from: interpolate(definition.from, variables),
  to: interpolate(definition.to, variables),
  label: interpolate(definition.label, variables),
  kind: definition.kind,
  origin: "project",
  project: variables.slug,
  tags: definition.tags.map((tag) => interpolate(tag, variables))
})

const buildDiscoveredNodes = (
  files: ReadonlyArray<DiscoveredFile>,
  manifests: ReadonlyArray<ProjectVariables>,
  modules: ReadonlyArray<ArchitectureModuleDefinition>
): ReadonlyArray<ArchitectureNode> => {
  const counts = new Map<string, { readonly node: ArchitectureNode; count: number }>()

  for (const file of files) {
    const node = classifyTrackedPath(file.relativePath, manifests, modules)
    const existing = counts.get(node.id)
    counts.set(node.id, existing ? { node: existing.node, count: existing.count + 1 } : { node, count: 1 })
  }

  return Array.from(counts.values()).map(({ node, count }) => ({
    ...node,
    detail: `${node.detail} · ${count} tracked file${count === 1 ? "" : "s"}`,
    stats: { trackedFiles: count }
  }))
}

const buildDiscoveredEdges = (
  imports: ReadonlyArray<{ readonly fromPath: string; readonly toPath: string }>,
  manifests: ReadonlyArray<ProjectVariables>,
  modules: ReadonlyArray<ArchitectureModuleDefinition>
): ReadonlyArray<ArchitectureEdge> =>
  dedupeBy(
    imports
      .map(({ fromPath, toPath }) => ({
        from: classifyTrackedPath(fromPath, manifests, modules).id,
        to: classifyTrackedPath(toPath, manifests, modules).id,
        label: "imports",
        kind: "dependency" as const,
        origin: "discovered" as const,
        tags: ["imports"]
      }))
      .filter((edge) => edge.from !== edge.to),
    (edge) => `${edge.from}:${edge.to}:${edge.label}:${edge.kind}`
  )

export class ArchitectureGraphBuilder extends Effect.Service<ArchitectureGraphBuilder>()("ArchitectureGraphBuilder", {
  effect: Effect.gen(function* () {
    const configRepository = yield* ArchitectureConfigRepository
    const manifestRepository = yield* ProjectManifestRepository
    const discovery = yield* ArchitectureDiscovery

    return {
      build: () =>
        Effect.gen(function* () {
          const config = yield* configRepository.load().pipe(
            Effect.mapError((error) => new ArchitectureGraphError({ reason: String(error) }))
          )
          const manifests = (yield* manifestRepository.loadAll().pipe(
            Effect.mapError((error) => new ArchitectureGraphError({ reason: String(error) }))
          )).map(projectVariables)
          const facts = yield* discovery.discover().pipe(
            Effect.mapError((error) => new ArchitectureGraphError({ reason: String(error) }))
          )
          const nodes = dedupeBy([
            ...buildDiscoveredNodes(facts.files, manifests, config.modules),
            ...config.topology.nodes.map(toDeclaredNode),
            ...manifests.flatMap((manifest) => config.topology.projectNodes.map((definition) => toProjectNode(definition, manifest)))
          ], (node) => node.id)
          const edges = dedupeBy([
            ...config.topology.edges.map(toDeclaredEdge),
            ...manifests.flatMap((manifest) => config.topology.projectEdges.map((definition) => toProjectEdge(definition, manifest))),
            ...buildDiscoveredEdges(facts.imports, manifests, config.modules)
          ], (edge) => `${edge.from}:${edge.to}:${edge.label}:${edge.kind}:${edge.origin}:${edge.project ?? ""}`)

          if (!nodes.length) {
            return yield* Effect.fail(new ArchitectureGraphError({ reason: "No architecture nodes were built" }))
          }

          return yield* Schema.decodeUnknown(ArchitectureGraphSchema)({ nodes, edges }).pipe(
            Effect.mapError((error) => new ArchitectureGraphError({ reason: String(error) })),
            Effect.withLogSpan("architecture.graph.build"),
            Effect.annotateLogs({ component: "architecture-graph" })
          )
        })
    }
  }),
  dependencies: [ArchitectureConfigRepository.Default, ProjectManifestRepository.Default, ArchitectureDiscovery.Default],
  accessors: true
}) {}
