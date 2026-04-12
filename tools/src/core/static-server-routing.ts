import path from "node:path"

const contentTypeByExtension: Readonly<Record<string, string>> = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".xml": "application/xml; charset=utf-8"
}

export const contentTypeForPath = (filePath: string) =>
  contentTypeByExtension[path.extname(filePath)] ?? "application/octet-stream"

const decodeRequestPath = (requestPath: string) => {
  try {
    return decodeURIComponent(requestPath.split("?")[0] || "/")
  } catch {
    return null
  }
}

export const resolveStaticRequestCandidates = (rootDirectory: string, requestPath: string): ReadonlyArray<string> | null => {
  const normalizedPath = decodeRequestPath(requestPath)
  if (normalizedPath === null) {
    return null
  }

  const absolutePath = path.resolve(rootDirectory, `.${normalizedPath}`)
  if (!absolutePath.startsWith(rootDirectory)) {
    return null
  }

  return [
    absolutePath,
    path.join(absolutePath, "index.html"),
    `${absolutePath}.html`
  ]
}

export const noStoreHeaders = (contentType: string) => ({
  "content-type": contentType,
  "cache-control": "no-store"
})
