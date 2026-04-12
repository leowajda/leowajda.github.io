import assert from "node:assert/strict"
import path from "node:path"
import test from "node:test"
import { graphWorkspaceDirectory } from "../src/graph/cache.js"
import { clangBuildDirectory } from "../src/graph/clang.js"
import type { GraphWorkspaceInput } from "../src/graph/model.js"

const workspace: GraphWorkspaceInput = {
  project_slug: "demo/project",
  workspace_slug: "native core",
  root_path: "/tmp/demo/native",
  kind: "scip-clang",
  primary_language: "cpp",
  source_extensions: [".cpp", ".h"],
  documents: [],
  resolve_file: () => null
}

test("clangBuildDirectory sanitizes cache path segments", () => {
  const buildDirectory = clangBuildDirectory(workspace)

  assert.equal(
    buildDirectory,
    path.join(graphWorkspaceDirectory, "demo_project", "native_core", "cmake-build")
  )
})
