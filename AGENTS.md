# AGENTS

Jekyll-first personal site: algorithm solutions (Eureka), code templates, source notes (Zibaldone), and writing.

## Layout

| Path | Role |
|------|------|
| `lib/site_kit/` | Domain library: catalogs, page contexts, search records, checks |
| `site-src/` | Jekyll source: layouts, includes, Sass, data, progressive JS, plugins |
| `sources/` | Content catalogs (eureka, templates, zibaldone submodules/files) |
| `script/` | Thin build/validate entrypoints |
| `test/` | Ruby unit tests for pure builders and validators |
| `tests/functional/` | Playwright tests for rendered behavior |
| `DESIGN.md` | UI, writing, navigation, and interaction authority |

## URL algebra

Public paths follow one resource model (built via `SiteKit::Core::ResourcePaths`):

| Pattern | Meaning |
|---------|---------|
| `/{project}/` | Project home |
| `/{project}/{collection}/` | Catalog / explorer |
| `/{project}/{collection}/{id}/` | Canonical resource (full page) |
| `/{project}/{collection}/{id}/embed/` | Same resource, embed representation |
| `…#{fragment}` | In-page selection only (language, approach, node) |

Concrete routes:

| Resource | URL |
|----------|-----|
| Problem catalog | `/eureka/problems/` |
| Problem | `/eureka/problems/{slug}/` |
| Problem embed (all languages, iframe-ready) | `/eureka/problems/{slug}/embed/` |
| Template embed | `/templates/{template-id}/embed/` |
| Source code embed | `…/embed/` on code documents |
| Templates | `/templates/` |
| Source notes home | `/zibaldone/` |
| Source language / module / doc | `/zibaldone/{lang}/…` |
| Writing | `/writing/{slug}/` |
| Search | `/search/?q=` |

Language is a filter on the problem explorer, not a separate path tree. Embeds use a bare layout (no site nav) and post `{ source: "remnote-iframe-plugin", type: "resize", height }` for iframe hosts. Every code box (problems, templates, source notes) shares `code_collection` and can expose `embed_url`.

## Philosophy

- Prefer static generation over runtime assembly. Generate structured data, pages, search records, navigation, and metadata at build time unless there is a clear user-facing reason to use JavaScript.
- JavaScript enhances rendered HTML. Do not move content, navigation, or search indexing into the browser when Jekyll, Liquid, data files, front matter, or build-time Ruby can express it.
- Search is Pagefind-only. Use Pagefind indexing, metadata, filters, sorting, and Search API — never a parallel search system.
- Template code bodies live under `sources/templates/<template-id>/`. Do not put editable snippets in YAML string blocks.
- When changing rendering, routing, content modeling, or plugins, choose the simplest idiomatic Jekyll mechanism.

## Architecture

Keep a clean program algebra: small explicit inputs, predictable outputs, one reason to change.

Separate concerns:

- loading and validating source catalogs
- modeling domain records
- adapting data into Jekyll pages (thin generators / page data)
- Pagefind extras for hash targets only
- checking rendered output
- enhancing browser interaction (progressive JS)

Prefer Liquid over Ruby view builders. Explorer filters and problem tables are Liquid over explorer data. Code switchers are Liquid over flat `implementations` / `entries` (no Ruby toolbar builders). Coordinators stay thin. Prefer typed, domain-specific failures that name the catalog, page, source, or invariant.

Build entry is `SiteKit::Build.for(site)` (cached on the Jekyll site). Generated pages are plain hashes via `SiteKit::Emit.page`. Plugins only attach data and emit pages — no view builders or Definition types.

### Code entry contract

One flat hash for every code box (`code_collection.html`):

| Field | Required | Notes |
|-------|----------|--------|
| `entry_id` | yes | Hash target / DOM id |
| `language`, `language_label` | yes | Toolbar language |
| `variant`, `variant_label` | yes | Toolbar variant (source YAML may still say `approach`) |
| `code`, `code_language` | yes | Body |
| `source_url`, `detail_url`, `embed_url` | optional | Action links |

Page data always exposes `entries` (never `implementations` / `code_entries` dual names).

## Setup

- `bundle install` — Ruby deps
- `pnpm install` — JS, Pagefind, Playwright when needed
- `pnpm sync:sources` — refresh content submodules only when catalogs need fresh external content
- `pnpm docs:refresh` — keep `README.md` → `AGENTS.md` symlink

## Commands

| Script | Purpose |
|--------|---------|
| `pnpm check:syntax` | Syntax-check catalog validation script |
| `pnpm validate:catalogs` | Validate source catalogs and generated registries |
| `pnpm build:site` | Jekyll HTML only |
| `pnpm build:pagefind` | Pagefind index from `_site` HTML + extras |
| `pnpm check:pagefind` | Verify Pagefind runtime assets and record count |
| `pnpm build:indexed-site` | Jekyll (writes Pagefind extras) + Pagefind index |
| `pnpm check:seo` | SEO metadata and sitemap/noindex alignment |
| `pnpm check:links` | Internal links in rendered site |
| `pnpm check:js` | JS syntax + ESLint |
| `pnpm lint:ruby` | RuboCop |
| `pnpm test:ruby` | Ruby unit tests |
| `pnpm test:functional` | Build + Playwright functional tests |
| `pnpm test:functional:built` | Playwright against already-built `_site` |
| `pnpm test:full` | Full local validation |
| `pnpm preview` | Build indexed site and serve `_site` at `http://127.0.0.1:4173` |

## Preview and debug

- Base URL: `http://127.0.0.1:4173`
- `pnpm preview` / `make serve` build, index, verify Pagefind, then serve `_site`
- `pnpm validate:catalogs` does not write site output
- Debug **rendered** pages, not raw Liquid templates

## Design

Read `DESIGN.md` before any UI, navigation, interaction, or copy change. Writing bar: Feynman clarity, Einstein-level explanation, Hemingway simplicity, Caesar’s concision. If a heading already says it, the body must add new information.

## JavaScript

- Progressive enhancement only: Jekyll owns content; JS selects, zooms, and enhances.
- Module budget: one entry file per page feature until it exceeds ~400 LOC of distinct concerns. Do not reintroduce satellite modules for state factories, rename wrappers, or thin event glue.
- Contracts over DOM IPC: no synthetic `.click()` across features; no double-`setTimeout` layout hacks. Prefer small exported APIs on the owning module.
- Modern ES modules and browser APIs. Shared helpers stay in `dom.js` (or one tiny lib) — not a utils folder.
- `pnpm check:js` for syntax and lint; do not bypass `eslint.config.mjs` without intentional, documented rule changes.
- Avoid eager work, global listeners, or extra runtime deps unless the interaction needs them.

## Templates

- Guide metadata: `site-src/_data/eureka/template_guide.yml`, `topics.yml`, `template_languages.yml`
- Code bodies: `sources/templates/<template-id>/<language>.<extension>`
- Minimal reusable snippets only — no package declarations, imports, `#include`, `using namespace`, or `class Solution` boilerplate
- New template or language: update source files and language catalog together

## Search

- Pagefind indexes rendered HTML (`data-pagefind-body` / `data-pagefind-filter` / `data-pagefind-meta` on problem and source pages)
- Template **hash targets** are the only custom extras (`pnpm build:pagefind-extras`)
- Rebuild with `pnpm build:indexed-site`; do not hand-edit `_site/pagefind`
- Problem explorer text search must pass active filters to Pagefind — no DOM text matching
- Search UI must keep proper dialog/combobox accessibility: focus management, Escape, keyboard navigation

## Playwright

- Live inspection: `playwright-cli` against `pnpm preview` (`http://127.0.0.1:4173`)
- Config: `.playwright/cli.config.json`
- Prefer `snapshot`, `screenshot`, `console`, `network`, `click`, `hover`, `eval`
- Prefer role/name locators; data attributes only for structural invariants
- Playwright Test for explorer, template guide, search, responsive behavior
- Ruby tests for pure builders, repositories, validators, and checks only

## Validation matrix

| Change area | Run |
|-------------|-----|
| Ruby, scripts, data registry | `pnpm lint:ruby && pnpm test:ruby && pnpm validate:catalogs` |
| Layouts, includes, Sass, JS, search, SEO, generated pages | `pnpm check:js && pnpm test:site && pnpm check:links` |
| Search UI, explorer, template guide, browser UX | `pnpm test:functional` |
| Handoff after code changes | `pnpm test:full` (or state why it could not run) |

Do not rely on Ruby tests alone for rendered page behavior.

## GitHub

- Use `gh` for GitHub operations
- Conventional commits: `type(scope): subject`
