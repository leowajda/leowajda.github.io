import { Effect } from "effect"
import fs from "node:fs/promises"
import { createServer, type Server } from "node:http"
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

const resolveRequestPath = async (rootDirectory: string, requestPath: string): Promise<string | null> => {
  const normalizedPath = decodeURIComponent(requestPath.split("?")[0] || "/")
  const absolutePath = path.resolve(rootDirectory, `.${normalizedPath}`)

  if (!absolutePath.startsWith(rootDirectory)) {
    return null
  }

  const candidates = [
    absolutePath,
    path.join(absolutePath, "index.html"),
    `${absolutePath}.html`
  ]

  for (const candidate of candidates) {
    try {
      const stats = await fs.stat(candidate)
      if (stats.isFile()) {
        return candidate
      }
    } catch {
      continue
    }
  }

  return null
}

export const startStaticServer = ({
  rootDirectory,
  host,
  port
}: {
  readonly rootDirectory: string
  readonly host: string
  readonly port: number
}) =>
  Effect.acquireRelease(
    Effect.tryPromise({
      try: () => new Promise<{ readonly server: Server; readonly url: string }>((resolve, reject) => {
        const server = createServer(async (request, response) => {
          const resolvedPath = await resolveRequestPath(rootDirectory, request.url ?? "/")

          if (!resolvedPath) {
            response.writeHead(404, { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" })
            response.end("Not Found")
            return
          }

          try {
            const body = await fs.readFile(resolvedPath)
            response.writeHead(200, {
              "content-type": contentTypeByExtension[path.extname(resolvedPath)] ?? "application/octet-stream",
              "cache-control": "no-store"
            })
            response.end(body)
          } catch {
            response.writeHead(500, { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" })
            response.end("Internal Server Error")
          }
        })

        server.once("error", reject)
        server.listen(port, host, () => resolve({ server, url: `http://${host}:${port}` }))
      }),
      catch: (error) => new Error(`Unable to start preview server: ${String(error)}`)
    }),
    ({ server }) =>
      Effect.sync(() => {
        server.closeAllConnections()
        server.close()
      })
  ).pipe(Effect.map(({ url }) => ({ url })))
