import { build } from "esbuild"
import { Effect } from "effect"
import { chromium } from "@playwright/test"
import path from "node:path"
import { DiagramRenderError } from "../core/errors.js"
import { rootDirectory } from "../core/paths.js"

const bundleRenderer = (diagram: string) =>
  Effect.tryPromise({
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
    catch: (error) => new DiagramRenderError({ diagram, reason: String(error) })
  })

export const renderMermaidToExcalidraw = (diagram: string, mermaid: string) =>
  Effect.gen(function* () {
    const bundle = yield* bundleRenderer(diagram)
    const browser = yield* Effect.acquireRelease(
      Effect.tryPromise({
        try: () => chromium.launch({ headless: true }),
        catch: (error) => new DiagramRenderError({ diagram, reason: String(error) })
      }),
      (instance) => Effect.promise(() => instance.close().catch(() => undefined))
    )
    const page = yield* Effect.acquireRelease(
      Effect.tryPromise({
        try: () => browser.newPage(),
        catch: (error) => new DiagramRenderError({ diagram, reason: String(error) })
      }),
      (instance) => Effect.promise(() => instance.close().catch(() => undefined))
    )

    yield* Effect.tryPromise({
      try: () => page.setContent(`<!DOCTYPE html><html><head><meta charset="utf-8"></head><body><script>${bundle}</script></body></html>`, { waitUntil: "load" }),
      catch: (error) => new DiagramRenderError({ diagram, reason: String(error) })
    })

    return yield* Effect.tryPromise({
      try: () => page.evaluate(async (value) => {
        if (!window.__renderArchitectureDiagram) {
          throw new Error("Architecture renderer was not installed")
        }

        return window.__renderArchitectureDiagram(value)
      }, mermaid),
      catch: (error) => new DiagramRenderError({ diagram, reason: String(error) })
    })
  })
