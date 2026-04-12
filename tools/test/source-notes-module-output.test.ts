import assert from "node:assert/strict"
import test from "node:test"
import { Effect } from "effect"
import { assembleSourceNotesModule, buildSourceNotesModuleData } from "../src/projects/source-notes/module-output.js"
import type { BuiltSourceDocument } from "../src/projects/source-notes/documents.js"
import type { ModuleCandidate } from "../src/projects/source-notes/discovery.js"
import type { ProjectManifest } from "../src/projects/schema.js"

const manifest: ProjectManifest = {
  kind: "source-notes",
  slug: "demo",
  title: "Demo Project",
  description: "Demo",
  route_base: "/projects/demo",
  source_repo_path: "sources/demo",
  source_optional: false
}

const moduleCandidate: ModuleCandidate = {
  slug: "core",
  title: "Core",
  absolutePath: "/tmp/demo/core",
  relativePath: "core",
  roots: [
    {
      language: "java",
      label: "src/main/java",
      absolutePath: "/tmp/demo/core/src/main/java"
    },
    {
      language: "scala",
      label: "src/main/scala",
      absolutePath: "/tmp/demo/core/src/main/scala"
    }
  ]
}

const builtDocuments: ReadonlyArray<BuiltSourceDocument> = [
  {
    metadata: {
      id: "core:src/main/java/com/example/Main.java",
      graph_node_id: "graph:java",
      title: "Main.java",
      url: "/projects/demo/core/com/example/main/",
      tree_path: "src/main/java/com/example/Main.java",
      source_path: "core/src/main/java/com/example/Main.java",
      source_url: "https://example.com/demo/blob/main/core/src/main/java/com/example/Main.java",
      language: "java",
      format: "code",
      breadcrumbs: [],
      code_references: null
    },
    file: {
      path: "/tmp/output/main-java.md",
      content: "java"
    }
  },
  {
    metadata: {
      id: "core:src/main/scala/example/App.scala",
      graph_node_id: "graph:scala",
      title: "App.scala",
      url: "/projects/demo/core/example/app/",
      tree_path: "src/main/scala/example/App.scala",
      source_path: "core/src/main/scala/example/App.scala",
      source_url: "https://example.com/demo/blob/main/core/src/main/scala/example/App.scala",
      language: "scala",
      format: "code",
      breadcrumbs: [],
      code_references: null
    },
    file: {
      path: "/tmp/output/app-scala.md",
      content: "scala"
    }
  }
]

test("buildSourceNotesModuleData assembles module roots and language labels", () => {
  const moduleData = buildSourceNotesModuleData(
    manifest,
    moduleCandidate,
    "https://example.com/demo/tree/main/core",
    "/assets/generated/demo/core/readme.png",
    builtDocuments
  )

  assert.equal(moduleData.slug, "core")
  assert.deepEqual(moduleData.language_labels, ["Java", "Scala"])
  assert.equal(moduleData.document_count, 2)
  assert.equal(moduleData.roots.length, 2)
  assert.equal(moduleData.roots[0]?.nodes[0]?.kind, "directory")
})

test("assembleSourceNotesModule composes module page and document files", async () => {
  const builtModule = await Effect.runPromise(assembleSourceNotesModule(
    manifest,
    moduleCandidate,
    {
      branch: "main",
      sourceUrl: "https://example.com/demo"
    },
    {
      markdown: "# Core",
      assets: [
        {
          source_path: "/tmp/demo/assets/readme.png",
          target_path: "/tmp/output/readme.png"
        }
      ],
      firstImageUrl: "/assets/generated/demo/core/readme.png"
    },
    builtDocuments
  ))

  assert.equal(builtModule.module.source_url, "https://example.com/demo/tree/main/core")
  assert.equal(builtModule.files.length, 3)
  assert.equal(builtModule.assets.length, 1)
  assert.match(builtModule.files[0]?.content ?? "", /permalink: \/projects\/demo\/core\//)
})
