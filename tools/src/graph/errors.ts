import { ParseResult } from "effect"
import { CodeGraphError } from "../core/errors.js"
import type { GraphWorkspaceInput } from "./model.js"

export const formatSchemaError = (error: ParseResult.ParseError) =>
  ParseResult.TreeFormatter.formatErrorSync(error)

export const codeGraphError = (
  workspace: GraphWorkspaceInput,
  phase: string,
  reason: string
) =>
  new CodeGraphError({
    project: workspace.project_slug,
    workspace: workspace.workspace_slug,
    phase,
    reason
  })

export const mapWorkspaceError = <E = unknown>(
  workspace: GraphWorkspaceInput,
  phase: string,
  format: (error: E) => string = String as (error: E) => string
) =>
  (error: E) => codeGraphError(workspace, phase, format(error))

export const formatCommandError = (error: unknown) => {
  if (error && typeof error === "object") {
    const command = "command" in error && typeof error.command === "string" ? error.command : ""
    const workingDirectory = "workingDirectory" in error && typeof error.workingDirectory === "string"
      ? error.workingDirectory
      : ""
    const reason = "reason" in error && typeof error.reason === "string" ? error.reason : String(error)

    if (command || workingDirectory) {
      return `${command} @ ${workingDirectory}: ${reason}`
    }

    return reason
  }

  return String(error)
}
