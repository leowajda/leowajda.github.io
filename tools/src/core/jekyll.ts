import path from "node:path"
import { generatedSiteDirectory } from "./paths.js"

export const generatedCollectionFile = (collection: string, ...segments: ReadonlyArray<string>) =>
  path.join(generatedSiteDirectory, `_${collection}`, ...segments)

export const generatedDataFile = (...segments: ReadonlyArray<string>) =>
  path.join(generatedSiteDirectory, "_data", "generated", ...segments)

export const generatedPageFile = (...segments: ReadonlyArray<string>) =>
  path.join(generatedSiteDirectory, ...segments)
