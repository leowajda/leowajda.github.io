# AGENTS

Jekyll-first personal site: Eureka (problems), algorithmic templates handbook, Zibaldone (source notes), writing.

`README.md` → this file (`pnpm docs:refresh`).

## Open by task

| If you need… | Go to |
|--------------|--------|
| Content catalogs, template snippets, submodules | `sources/` |
| Layouts, includes, Liquid, Sass, `_data`, PE JS, plugins | `site-src/` |
| Build loaders, emit, checks, Pagefind extras | `lib/site_kit/` |
| CLI / pnpm wrappers | `script/`, `package.json` |
| Ruby contracts | `test/` |
| Playwright | `tests/functional/` |
| Opencode slash commands only | `.opencode/command/` (tooling; not product docs) |

Do not put product architecture in `.opencode/`. Commands there may point here.

## Stack

| Layer | Tech |
|-------|------|
| Site | Jekyll (`site-src/` → `_site/`) |
| Build | Ruby `SiteKit::Build` + thin generators in `site-src/_plugins/` |
| UI | Liquid layouts/includes, Sass |
| JS | Progressive ES modules under `site-src/assets/js/` |
| Search | Pagefind only (HTML index + template hash extras) |
| Tests | Minitest contracts, Playwright, RuboCop, ESLint |
| Package | `bundle` + `pnpm` |

## Architecture

```
sources/ + site-src/_data
  → SiteKit::Build (load, validate, emit pages, search extras)
  → generators attach data + add pages
  → Liquid
  → HTML
  → Pagefind
```

| Path | Role |
|------|------|
| `lib/site_kit/build.rb` | `pages`, `search_extras`, `validate!`, domain accessors |
| `lib/site_kit/eureka.rb` | Problems → explorer + pages |
| `lib/site_kit/templates.rb` | Guide + code + embeds + reference resolve |
| `lib/site_kit/source_notes.rb` | Zibaldone tree → docs/pages |
| `lib/site_kit/core.rb` | Paths, Helpers, CodeEntry, errors |
| `lib/site_kit/search.rb` | Template hash Pagefind extras |
| `lib/site_kit/checks.rb` | SEO, links, catalogs, vendor |
| `site-src/_plugins/` | Thin Jekyll generators / hooks only |

Plugins call `Build` only. Attach runs in `site_build_generator`.

## Public URLs

| Resource | URL |
|----------|-----|
| Problems | `/eureka/problems/`, `/eureka/problems/{slug}/`, `…/embed/` |
| Templates handbook | `/templates/` + `#pattern` or `#pattern/variant` |
| Template embed | `/templates/{template-id}/embed/` |
| Zibaldone | `/zibaldone/…` (code docs may have `…/embed/`) |
| Writing | `/writing/{slug}/` |
| Search | `/search/?q=` |

Embeds: bare layout; post `{ source: "remnote-iframe-plugin", type: "resize", height }` for iframe hosts.

Templates are **one handbook page**, not path-per-template. Nav uses hash links; PE shows the matching panel. Pagefind extras exist so search can deep-link `#…` while panels stay mutually exclusive.

## Code box

One flat `entries[]` on every code surface → `code_collection.html` (`kind='problem'` for fixed Approach variants).

| Field | Required |
|-------|----------|
| `entry_id`, `language`, `language_label`, `variant`, `variant_label`, `code`, `code_language` | yes |
| `source_url`, `detail_url`, `embed_url` | optional |

Source YAML may still say `implementations` / `approach`; public page data is always `entries` / `variant`.

Template snippets: `sources/templates/<id>/<lang>.<ext>` — minimal bodies, no package/import/`Solution` boilerplate. Guide meta: `site-src/_data/eureka/template_guide.yml`, `topics.yml`, `template_languages.yml`.

## Hard rules

- Jekyll owns content; JS only progressive enhancement.
- Prefer Liquid and build-time data over browser assembly.
- Pagefind-only search — no parallel index or DOM text search for explorer queries (pass filters to Pagefind).
- No synthetic `.click()` across JS features; small exported APIs on the owning module.
- One PE entry file per feature until ~400 LOC of real concerns — no satellite rename wrappers.
- Simplest idiomatic Jekyll mechanism when changing render/routing/plugins.
- UI/copy: clarity over cleverness; short sentences; no filler; every control earns its space. Icon-first global nav; monochrome, bordered, monospace identity.

## Setup

```bash
bundle install && pnpm install
pnpm sync:sources   # when external catalogs need refresh
pnpm docs:refresh   # README.md → AGENTS.md
```

## Commands

| Script | Purpose |
|--------|---------|
| `pnpm validate:catalogs` | Source catalogs + registries |
| `pnpm build:site` | Jekyll HTML |
| `pnpm build:indexed-site` | Jekyll + Pagefind (+ extras) |
| `pnpm check:pagefind` / `check:seo` / `check:links` / `check:js` | Checks |
| `pnpm lint:ruby` / `pnpm test:ruby` | Ruby |
| `pnpm test:functional` | Build + Playwright |
| `pnpm test:functional:built` | Playwright on existing `_site` |
| `pnpm test:full` | Full local gate |
| `pnpm preview` | Indexed site at `http://127.0.0.1:4173` |

Debug **rendered** `_site` pages, not raw Liquid alone.

## Validation matrix

| Change area | Run |
|-------------|-----|
| Ruby, scripts, catalogs | `pnpm lint:ruby && pnpm test:ruby && pnpm validate:catalogs` |
| Layouts, includes, Sass, JS, SEO | `pnpm check:js && pnpm test:site && pnpm check:links` |
| Search, explorer, templates UX | `pnpm test:functional` |
| Handoff | `pnpm test:full` (or state why not) |

Do not rely on Ruby tests alone for browser behavior.

## Playwright

- Against preview `http://127.0.0.1:4173` (or built `_site`).
- Prefer role/name locators; data attributes for structural invariants only.
- Config: `.playwright/cli.config.json` when using CLI inspection.

## Git

- `gh` for GitHub.
- Conventional commits: `type(scope): subject`.
