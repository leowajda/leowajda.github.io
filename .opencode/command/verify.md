---
description: Run project verification for recent or scoped changes
agent: build
---

Verify the project after work on: $ARGUMENTS

Prefer the narrowest script that covers the change (see AGENTS.md validation matrix):
- Ruby / scripts / catalogs → `pnpm lint:ruby && pnpm test:ruby && pnpm validate:catalogs`
- Layouts, includes, Sass, JS, search, SEO → `pnpm check:js && pnpm test:site && pnpm check:links`
- Search UI, explorer, template guide, browser UX → `pnpm test:functional`
- Release confidence → `pnpm test:full`

Report what ran, what passed/failed, and any commands that could not run.
