import { Effect } from "effect"
import type { CodeReferencesPanel } from "../../../../packages/graph/src/index.js"
import { buildCodeReferencePanels } from "../../graph/service.js"
import {
  buildGraphWorkspaceInputs,
  resolveWorkspaceRootByModule,
  type ModuleGraphInput
} from "./workspaces.js"

export const buildSourceNotesReferencePanels = (
  manifestSlug: string,
  repoRoot: string,
  builtModules: ReadonlyArray<ModuleGraphInput>
) =>
  Effect.gen(function* () {
    const workspaceRootByModule = yield* resolveWorkspaceRootByModule(repoRoot, builtModules)
    const graphWorkspaces = buildGraphWorkspaceInputs(manifestSlug, repoRoot, builtModules, workspaceRootByModule)

    return yield* buildCodeReferencePanels(graphWorkspaces)
  })
