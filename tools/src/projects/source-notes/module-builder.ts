import { Effect } from "effect"
import path from "node:path"
import type { ProjectManifest } from "../schema.js"
import { maybeReadText, rewriteMarkdownAssets } from "./assets.js"
import { type ModuleCandidate } from "./discovery.js"
import { buildModuleDocuments } from "./module-documents.js"
import { assembleSourceNotesModule, type BuiltModule } from "./module-output.js"

export const buildSourceNotesModule = (
  manifest: ProjectManifest,
  moduleCandidate: ModuleCandidate,
  repoRoot: string,
  gitMetadata: { readonly branch: string; readonly sourceUrl: string }
) =>
  Effect.gen(function* () {
    const readmePath = path.join(moduleCandidate.absolutePath, "README.md")
    const readmeSource = yield* maybeReadText(readmePath)
    const readme = yield* rewriteMarkdownAssets(readmeSource, moduleCandidate.absolutePath, `${manifest.slug}/${moduleCandidate.slug}`)
    const builtDocuments = yield* buildModuleDocuments(manifest, moduleCandidate, repoRoot, gitMetadata)

    return yield* assembleSourceNotesModule(manifest, moduleCandidate, gitMetadata, readme, builtDocuments)
  })

export type { BuiltModule }
