import { Effect } from "effect"
import path from "node:path"
import { generatedSiteDirectory } from "../../core/paths.js"
import { FileStore } from "../../core/workspace.js"
import type { GeneratedAssetFile } from "../types.js"

export type PageAsset = {
  readonly markdown: string
  readonly assets: ReadonlyArray<GeneratedAssetFile>
  readonly firstImageUrl: string
}

const markdownImagePattern = /!\[([^\]]*)\]\(([^)]+)\)/g

const sanitizeAssetPath = (rawPath: string) =>
  rawPath
    .replace(/^<|>$/g, "")
    .split(/\s+/)[0]

const sanitizeAssetTargetPath = (assetPath: string) => {
  const normalized = assetPath
    .split("/")
    .filter((segment) => segment !== "" && segment !== "." && segment !== "..")
    .join("/")

  return normalized || path.basename(assetPath)
}

export const maybeReadText = (filePath: string) =>
  Effect.gen(function* () {
    const fileStore = yield* FileStore
    const exists = yield* fileStore.fileExists(filePath)
    if (!exists) {
      return ""
    }

    return yield* fileStore.readText(filePath)
  })

export const rewriteMarkdownAssets = (
  markdown: string,
  baseDirectory: string,
  assetScope: string
) =>
  Effect.gen(function* () {
    const fileStore = yield* FileStore
    const seen = new Map<string, string>()
    const assets: Array<GeneratedAssetFile> = []
    let firstImageUrl = ""

    const matches = Array.from(markdown.matchAll(markdownImagePattern))
    for (const match of matches) {
      const rawReference = match[2] ?? ""
      const cleanReference = sanitizeAssetPath(rawReference)
      if (!cleanReference || cleanReference.startsWith("http://") || cleanReference.startsWith("https://") || cleanReference.startsWith("/")) {
        continue
      }

      if (!seen.has(cleanReference)) {
        const sourcePath = path.resolve(baseDirectory, cleanReference)
        const exists = yield* fileStore.fileExists(sourcePath)
        if (!exists) {
          continue
        }

        const targetPath = path.join(generatedSiteDirectory, "assets/generated", assetScope, sanitizeAssetTargetPath(cleanReference))
        const publicUrl = `/${path.relative(generatedSiteDirectory, targetPath).split(path.sep).join("/")}`
        seen.set(cleanReference, publicUrl)
        assets.push({ source_path: sourcePath, target_path: targetPath })
        if (!firstImageUrl) {
          firstImageUrl = publicUrl
        }
      }
    }

    let rewritten = markdown
    for (const [reference, publicUrl] of seen.entries()) {
      rewritten = rewritten.replaceAll(`](${reference})`, `](${publicUrl})`)
      rewritten = rewritten.replaceAll(`](<${reference}>)`, `](${publicUrl})`)
    }

    return {
      markdown: rewritten.trim(),
      assets,
      firstImageUrl
    } satisfies PageAsset
  })
