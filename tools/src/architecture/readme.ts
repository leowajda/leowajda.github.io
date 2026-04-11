import type { ArchitectureGraph } from "./schema.js"

const section = (title: string, body: string) => `## ${title}\n\n${body}`

const commandList = [
  ["Install deps", "`pnpm install && bundle install`"],
  ["Sync sources", "`pnpm sync:sources`"],
  ["Generate site", "`pnpm generate`"],
  ["Preview rendered site", "`pnpm preview`"],
  ["Typecheck", "`pnpm typecheck`"],
  ["Tool tests", "`pnpm test:tools`"],
  ["Refresh docs + diagrams", "`pnpm docs:refresh`"]
].map(([name, command]) => `- ${name}: ${command}`).join("\n")

const nodeSummary = (graph: ArchitectureGraph, group: string) =>
  graph.nodes
    .filter((node) => node.group === group)
    .map((node) => "- `" + node.label + "`: " + node.detail)
    .join("\n") || "- none"

export const renderReadme = (graph: ArchitectureGraph) => {
  const totalEdges = graph.edges.length
  const totalNodes = graph.nodes.length

  return [
    "# leowajda.github.io",
    "",
    "Personal site plus source-driven project generators. The main dynamic project is `eureka`, which reads external source data and generates rendered site pages and data from it.",
    "",
    section("Commands", commandList),
    "",
    section("Architecture", [
      `Generated from the current repo graph: ${totalNodes} nodes, ${totalEdges} edges.`,
      "",
      "![Repository architecture](docs/generated/architecture.svg)"
    ].join("\n")),
    "",
    section("Module Map", [
      "### Source Repos",
      nodeSummary(graph, "Source Repos"),
      "",
      "### Project Manifests",
      nodeSummary(graph, "Project Manifests"),
      "",
      "### Tools",
      nodeSummary(graph, "Tools"),
      "",
      "### Packages",
      nodeSummary(graph, "Packages"),
      "",
      "### Site",
      nodeSummary(graph, "Site")
    ].join("\n")),
    "",
    section("AI Workflow", [
      "- Use `pnpm preview` to boot the real rendered site on `http://127.0.0.1:4173`.",
      "- Use the repo Playwright config for browser inspection, screenshots, and DOM checks.",
      "- Prefer debugging rendered pages over raw templates.",
      "- See `AGENTS.md` for the concise runbook."
    ].join("\n")),
    ""
  ].join("\n")
}
