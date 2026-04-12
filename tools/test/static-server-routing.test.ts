import assert from "node:assert/strict"
import path from "node:path"
import test from "node:test"
import { contentTypeForPath, noStoreHeaders, resolveStaticRequestCandidates } from "../src/core/static-server-routing.js"

test("resolveStaticRequestCandidates normalizes request paths into file and index candidates", () => {
  const rootDirectory = "/tmp/site"
  const candidates = resolveStaticRequestCandidates(rootDirectory, "/posts/hello-world?draft=false")

  assert.deepEqual(candidates, [
    path.join(rootDirectory, "posts/hello-world"),
    path.join(rootDirectory, "posts/hello-world", "index.html"),
    path.join(rootDirectory, "posts/hello-world.html")
  ])
})

test("resolveStaticRequestCandidates rejects traversal outside the site root", () => {
  assert.equal(resolveStaticRequestCandidates("/tmp/site", "/../secret.txt"), null)
})

test("contentTypeForPath and noStoreHeaders produce stable static responses", () => {
  assert.equal(contentTypeForPath("/tmp/site/assets/app.js"), "text/javascript; charset=utf-8")
  assert.equal(contentTypeForPath("/tmp/site/assets/blob.bin"), "application/octet-stream")
  assert.deepEqual(noStoreHeaders("text/plain; charset=utf-8"), {
    "content-type": "text/plain; charset=utf-8",
    "cache-control": "no-store"
  })
})
