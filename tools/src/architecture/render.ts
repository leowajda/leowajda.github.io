import { chromium, type Page } from "@playwright/test"
import { build } from "esbuild"
import { Effect, Schema } from "effect"
import path from "node:path"
import { DiagramRenderError } from "../core/errors.js"
import { rootDirectory } from "../core/paths.js"
import { ArchitectureConfigRepository } from "./config.js"
import { renderArchitectureMermaid } from "./mermaid.js"
import { ArchitectureSettings } from "./settings.js"
import {
  DiagramRenderResultSchema,
  DiagramRenderSpecSchema,
  type ArchitectureDiagram,
  type ArchitectureGraph,
  type DiagramRenderResult
} from "./schema.js"

const bundleRenderer = Effect.tryPromise({
  try: async () => {
    const result = await build({
      entryPoints: [path.join(rootDirectory, "tools/src/architecture/browser-renderer.ts")],
      bundle: true,
      write: false,
      format: "iife",
      platform: "browser",
      target: "es2022"
    })

    const output = result.outputFiles?.[0]?.text
    if (!output) {
      throw new Error("Renderer bundle was empty")
    }

    return output
  },
  catch: (error) => new DiagramRenderError({ diagram: "bundle", reason: String(error) })
})

const installRenderer = (page: Page, bundle: string) =>
  Effect.tryPromise({
    try: () => page.setContent(`<!DOCTYPE html><html><head><meta charset="utf-8"></head><body><script>${bundle}</script></body></html>`, { waitUntil: "load" }),
    catch: (error) => new DiagramRenderError({ diagram: "bundle", reason: String(error) })
  })

export class DiagramRenderer extends Effect.Service<DiagramRenderer>()("DiagramRenderer", {
  scoped: Effect.gen(function* () {
    const configRepository = yield* ArchitectureConfigRepository
    const bundle = yield* bundleRenderer
    const browser = yield* Effect.acquireRelease(
      Effect.tryPromise({
        try: () => chromium.launch({ headless: true }),
        catch: (error) => new DiagramRenderError({ diagram: "browser", reason: String(error) })
      }),
      (instance) => Effect.promise(() => instance.close().catch(() => undefined))
    )
    const page = yield* Effect.acquireRelease(
      Effect.tryPromise({
        try: () => browser.newPage(),
        catch: (error) => new DiagramRenderError({ diagram: "browser", reason: String(error) })
      }),
      (instance) => Effect.promise(() => instance.close().catch(() => undefined))
    )

    yield* installRenderer(page, bundle)

    return {
      render: (graph: ArchitectureGraph, diagram: ArchitectureDiagram) =>
        Effect.gen(function* () {
          const config = yield* configRepository.load().pipe(
            Effect.mapError((error) => new DiagramRenderError({ diagram: diagram.id, reason: String(error) }))
          )
          const nodes = graph.nodes.filter((node) => diagram.nodeIds.includes(node.id))
          const activeGroupIds = new Set(nodes.map((node) => node.group).concat(diagram.annotations.map((annotation) => annotation.tone)))
          const groups = config.groups
            .filter((group) => activeGroupIds.has(group.id))
            .map((group) => ({ id: group.id, title: group.title, palette: group.palette }))
          const mermaid = renderArchitectureMermaid(graph, diagram, config.groups)
          const payload = yield* Schema.decodeUnknown(DiagramRenderSpecSchema)({
            id: diagram.id,
            title: diagram.title,
            mermaid,
            groups,
            nodes: nodes.map((node) => ({ id: node.id, label: node.label, group: node.group })),
            annotations: diagram.annotations
          }).pipe(
            Effect.mapError((error) => new DiagramRenderError({ diagram: diagram.id, reason: String(error) }))
          )

          const rendered = yield* Effect.tryPromise({
            try: () => page.evaluate(async (spec) => {
              if (!window.__renderArchitectureDiagram) {
                throw new Error("Architecture renderer was not installed")
              }

              return window.__renderArchitectureDiagram(spec)
            }, payload),
            catch: (error) => new DiagramRenderError({ diagram: diagram.id, reason: String(error) })
          }).pipe(
            Effect.flatMap((result) =>
              Schema.decodeUnknown(DiagramRenderResultSchema)(result).pipe(
                Effect.mapError((error) => new DiagramRenderError({ diagram: diagram.id, reason: String(error) }))
              )
            ),
            Effect.withLogSpan("architecture.diagram.render"),
            Effect.annotateLogs({ component: "architecture-render", diagram: diagram.id })
          )

          return { mermaid, rendered }
        })
    }
  }),
  dependencies: [ArchitectureConfigRepository.Default],
  accessors: true
}) {}
