import { Effect, Schema } from "effect"
import { ArchitectureCompileError } from "../core/errors.js"
import {
  ArchitectureDiagramSchema,
  type ArchitectureConfig,
  type ArchitectureDiagram,
  type ArchitectureGraph,
  type DiagramSelector
} from "./schema.js"

const matchesSelector = (
  selector: DiagramSelector,
  node: ArchitectureGraph["nodes"][number]
) => {
  const matchesIds = !selector.ids?.length || selector.ids.includes(node.id)
  const matchesGroups = !selector.groups?.length || selector.groups.map(String).includes(node.group)
  const matchesRoles = !selector.roles?.length || (node.role ? selector.roles.includes(node.role) : false)
  const matchesTags = !selector.tags?.length || selector.tags.some((tag) => node.tags.includes(tag))
  const matchesProjects = !selector.projects?.length || (node.project ? selector.projects.includes(node.project) : false)
  const matchesOrigins = !selector.origins?.length || selector.origins.includes(node.origin)

  return matchesIds && matchesGroups && matchesRoles && matchesTags && matchesProjects && matchesOrigins
}

const selectNodeIds = (graph: ArchitectureGraph, selectors: ReadonlyArray<DiagramSelector>) => {
  if (!selectors.length) {
    return graph.nodes.map((node) => node.id)
  }

  const selected = graph.nodes.filter((node) => selectors.some((selector) => matchesSelector(selector, node)))
  return Array.from(new Set(selected.map((node) => node.id)))
}

const resolveAnnotationTarget = (diagramId: string, graph: ArchitectureGraph, selector: DiagramSelector) => {
  const matches = graph.nodes.filter((node) => matchesSelector(selector, node))
  if (matches.length !== 1) {
    return Effect.fail(new ArchitectureCompileError({
      diagram: diagramId,
      reason: `Annotation selector resolved to ${matches.length} nodes`
    }))
  }

  return Effect.succeed(matches[0].id)
}

export const compileArchitectureDiagrams = (
  config: ArchitectureConfig,
  graph: ArchitectureGraph
): Effect.Effect<ReadonlyArray<ArchitectureDiagram>, ArchitectureCompileError> =>
  Effect.forEach(config.diagrams, (diagramDefinition) =>
    Effect.gen(function* () {
      const nodeIds = selectNodeIds(graph, diagramDefinition.selectors)
      const annotations = yield* Effect.forEach(diagramDefinition.annotations, (annotation) =>
        Effect.gen(function* () {
          const target = yield* resolveAnnotationTarget(diagramDefinition.id, graph, annotation.target)
          return {
            id: annotation.id,
            target,
            text: annotation.text,
            placement: annotation.placement,
            tone: annotation.tone
          }
        })
      ).pipe(
        Effect.mapError((error) =>
          error instanceof ArchitectureCompileError
            ? error
            : new ArchitectureCompileError({ diagram: diagramDefinition.id, reason: String(error) })
        )
      )

      return yield* Schema.decodeUnknown(ArchitectureDiagramSchema)({
        id: diagramDefinition.id,
        title: diagramDefinition.title,
        direction: diagramDefinition.direction,
        nodeIds,
        annotations,
        mermaid: diagramDefinition.mermaid,
        render: diagramDefinition.render
      }).pipe(
        Effect.mapError((error) => new ArchitectureCompileError({ diagram: diagramDefinition.id, reason: String(error) })),
        Effect.withLogSpan("architecture.diagram.compile"),
        Effect.annotateLogs({ component: "architecture-compile", diagram: diagramDefinition.id })
      )
    })
  )
