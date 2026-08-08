---
description: Run project verification for recent or scoped changes
agent: build
---

Verify the project after work on: $ARGUMENTS

Use the validation matrix in AGENTS.md. Prefer the narrowest script that covers the change:
- Ruby / catalogs → `pnpm lint:ruby && pnpm test:ruby && pnpm validate:catalogs`
- Layouts / JS / SEO → `pnpm check:js && pnpm test:site && pnpm check:links`
- Browser UX → `pnpm test:functional`
- Release confidence → `pnpm test:full`

Report what ran, what passed/failed, and any commands that could not run.
