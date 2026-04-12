import { Effect } from "effect"
import fs from "node:fs/promises"
import { createServer, type Server } from "node:http"
import { contentTypeForPath, noStoreHeaders, resolveStaticRequestCandidates } from "./static-server-routing.js"

const resolveRequestPath = async (rootDirectory: string, requestPath: string): Promise<string | null> => {
  const candidates = resolveStaticRequestCandidates(rootDirectory, requestPath)
  if (candidates === null) {
    return null
  }

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
            response.writeHead(404, noStoreHeaders("text/plain; charset=utf-8"))
            response.end("Not Found")
            return
          }

          try {
            const body = await fs.readFile(resolvedPath)
            response.writeHead(200, noStoreHeaders(contentTypeForPath(resolvedPath)))
            response.end(body)
          } catch {
            response.writeHead(500, noStoreHeaders("text/plain; charset=utf-8"))
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
