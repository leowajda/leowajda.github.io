import path from "node:path"
import { fileURLToPath } from "node:url"

export const rootDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..")
export const architectureDirectory = path.join(rootDirectory, "architecture")
export const themeSourceDirectory = path.join(rootDirectory, "packages/theme/src")
export const siteSourceDirectory = path.join(rootDirectory, "site-src")
export const generatedSiteDirectory = path.join(rootDirectory, "site")
export const projectsDirectory = path.join(rootDirectory, "projects")
export const nodeModulesDirectory = path.join(rootDirectory, "node_modules")
export const docsDirectory = path.join(rootDirectory, "docs")
export const generatedDocsDirectory = path.join(docsDirectory, "generated")
