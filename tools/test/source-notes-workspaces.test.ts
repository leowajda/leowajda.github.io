import assert from "node:assert/strict"
import path from "node:path"
import test from "node:test"
import { buildGraphWorkspaceInputs, type ModuleGraphInput } from "../src/projects/source-notes/workspaces.js"

test("buildGraphWorkspaceInputs groups code documents by workspace root", () => {
  const repoRoot = "/tmp/repo"
  const builtModules: ReadonlyArray<ModuleGraphInput> = [
    {
      modulePath: path.join(repoRoot, "services/orders"),
      moduleSlug: "orders",
      documents: [
        {
          id: "orders:src/Main.java",
          graph_node_id: "graph:orders:main",
          title: "Main.java",
          url: "/orders/main/",
          tree_path: "jvm/src/Main.java",
          source_path: "services/orders/src/Main.java",
          source_url: "",
          language: "java",
          format: "code",
          breadcrumbs: [],
          code_references: null
        },
        {
          id: "orders:README.md",
          graph_node_id: "graph:orders:readme",
          title: "README.md",
          url: "/orders/readme/",
          tree_path: "docs/README.md",
          source_path: "services/orders/README.md",
          source_url: "",
          language: "markdown",
          format: "markdown",
          breadcrumbs: [],
          code_references: null
        }
      ]
    },
    {
      modulePath: path.join(repoRoot, "services/payments"),
      moduleSlug: "payments",
      documents: [
        {
          id: "payments:src/App.scala",
          graph_node_id: "graph:payments:app",
          title: "App.scala",
          url: "/payments/app/",
          tree_path: "jvm/src/App.scala",
          source_path: "services/payments/src/App.scala",
          source_url: "",
          language: "scala",
          format: "code",
          breadcrumbs: [],
          code_references: null
        }
      ]
    }
  ]
  const workspaceRootByModule = new Map<string, string>([
    ["orders", path.join(repoRoot, "services")],
    ["payments", path.join(repoRoot, "services")]
  ])

  const workspaces = buildGraphWorkspaceInputs("demo", repoRoot, builtModules, workspaceRootByModule)

  assert.equal(workspaces.length, 1)
  assert.equal(workspaces[0]?.workspace_slug, "services")
  assert.deepEqual(workspaces[0]?.source_extensions, [".java", ".scala", ".sc"])
  assert.deepEqual(
    workspaces[0]?.documents.map((document) => document.workspace_relative_path),
    ["orders/src/Main.java", "payments/src/App.scala"]
  )
  assert.equal(workspaces[0]?.resolve_file("orders/src/Main.java")?.url, "/orders/main/")
  assert.equal(workspaces[0]?.resolve_file("README.md"), null)
})
