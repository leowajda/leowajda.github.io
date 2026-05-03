# AGENTS

## Documentation Rule
- Do not rely on memory for framework behavior. If a change touches Jekyll, Ruby, JavaScript, Pagefind, accessibility, or build/test tooling, consult the linked authoritative docs before deciding the implementation.
- Mention the relevant docs in your reasoning when an implementation depends on framework behavior.
- Prefer primary docs over blog posts, snippets, or inferred conventions.

## Authoritative References
- Jekyll: https://jekyllrb.com/docs/
- Jekyll data files: https://jekyllrb.com/docs/datafiles/
- Jekyll layouts: https://jekyllrb.com/docs/layouts/
- Jekyll includes: https://jekyllrb.com/docs/includes/
- Jekyll front matter: https://jekyllrb.com/docs/front-matter/
- Jekyll collections: https://jekyllrb.com/docs/collections/
- Jekyll generators: https://jekyllrb.com/docs/plugins/generators/
- Ruby style: https://rubystyle.guide/
- JavaScript: https://developer.mozilla.org/en-US/docs/Web/JavaScript
- JavaScript modules: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules
- JavaScript performance: https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Performance/JavaScript
- ESLint configuration: https://eslint.org/docs/latest/use/configure/
- Pagefind home: https://pagefind.app/
- Pagefind docs: https://pagefind.app/docs/
- Pagefind indexing: https://pagefind.app/docs/indexing/
- Pagefind Node API: https://pagefind.app/docs/node-api/
- Pagefind search API: https://pagefind.app/docs/api/
- Pagefind search config: https://pagefind.app/docs/search-config/
- Pagefind API reference: https://pagefind.app/docs/api-reference/
- Pagefind metadata: https://pagefind.app/docs/metadata/
- Pagefind filters: https://pagefind.app/docs/filtering/
- Pagefind sorting: https://pagefind.app/docs/sorting/
- Pagefind ranking: https://pagefind.app/docs/ranking/
- Pagefind sub-results: https://pagefind.app/docs/sub-results/
- WAI-ARIA dialog pattern: https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/
- WAI-ARIA combobox pattern: https://www.w3.org/WAI/ARIA/apg/patterns/combobox/

## Project Philosophy
- This is a Jekyll-first static website. When changing rendering, routing, content modeling, data loading, templates, generated pages, or plugins, read the relevant Jekyll docs and choose the simplest idiomatic Jekyll mechanism.
- Prefer static generation over runtime assembly. Generate structured data, pages, search records, navigation, and metadata during the build unless there is a clear user-facing reason to defer work to JavaScript.
- JavaScript should enhance rendered HTML. Do not move content, navigation, or search indexing into browser code when Jekyll, Liquid, data files, front matter, or build-time Ruby can express the requirement.
- Search is Pagefind-backed. Use Pagefind's documented indexing, metadata, filters, sorting, and API model instead of inventing a parallel search system.
- Algorithm template snippets are source files under `sources/templates`, loaded by Ruby at build time, then rendered statically by Jekyll. Do not put editable code snippets back into YAML string blocks.

## Architecture Principles
- Keep the program algebra clean: each component should have a small explicit input, a predictable output, and one reason to change.
- Separate concerns by responsibility:
  - loading and validating source catalogs
  - modeling domain records
  - building page/context data
  - generating search records
  - adapting data into Jekyll pages
  - checking rendered output
  - enhancing browser interaction
- Coordinators should wire components together. Domain rules should live near the domain data they validate or transform.
- Keep scripts thin. Reusable production behavior belongs in library code with focused tests.
- Prefer typed, domain-specific failures over generic runtime failures. Error messages should identify the catalog, page, source, or invariant that failed.
- Keep tests shaped like the code. Test pure builders and validators with Ruby tests; test rendered behavior, keyboard interaction, and responsive behavior with Playwright.
- Add abstractions only when they clarify data flow, remove real duplication, or protect a stable boundary.

## Setup
- Install Ruby dependencies with `bundle install`.
- Install Node dependencies with `pnpm install` when JavaScript, Pagefind, Playwright, or browser automation is needed.
- Sync submodules with `pnpm sync:sources` only when source-backed catalogs need fresh external content.
- Sync the `README.md` symlink to `AGENTS.md` with `pnpm docs:refresh`.

## Core Commands
- Syntax-check catalog validation: `pnpm check:validate`
- Validate source catalogs and generated registries: `pnpm validate:catalogs`
- Build only Jekyll HTML: `pnpm build:site`
- Build Pagefind search records: `pnpm build:search-records`
- Build the Pagefind index from `_site`: `pnpm build:pagefind`
- Verify Pagefind runtime assets and record count: `pnpm check:pagefind`
- Build the full indexed site: `pnpm build:indexed-site`
- Verify rendered SEO metadata and sitemap/noindex alignment: `pnpm check:seo`
- Verify internal links in the rendered site: `pnpm check:links`
- Check JavaScript syntax and lint rules: `pnpm check:js`
- Lint Ruby: `pnpm lint:ruby`
- Run Ruby tests: `pnpm test:ruby`
- Run rendered-page functional tests: `pnpm test:functional`
- Run functional tests against an already built site: `pnpm test:functional:built`
- Run full local validation: `pnpm test:full`
- Preview the rendered indexed site: `pnpm preview`

## Preview
- Base URL: `http://127.0.0.1:4173`
- `pnpm preview` and `make serve` build the site, generate the Pagefind index, verify Pagefind output, then serve `_site`.
- `pnpm build:search-records` runs the Jekyll runtime, writes `_site`, and exports `tmp/search-records.json` from that processed site context.
- `pnpm validate:catalogs` is separate from preview and build. It validates source catalogs and generated registries without writing files.
- Debug rendered pages, not raw templates.

## Design
- Read [DESIGN.md](DESIGN.md) before any UI, navigation, interaction, or copy change.
- `DESIGN.md` is the authoritative source of truth for the site's philosophy, writing, and interface rules.
- The writing bar is not optional: Feynman clarity, Einstein-level explanation, Hemingway simplicity, Caesar's concision.
- Do not waste the reader's time. If a heading already says it, the body must move forward instead of repeating it.

## JavaScript
- Use modern ES modules and browser APIs according to MDN. Keep modules small and focused.
- Keep DOM code explicit and progressive. Prefer semantic HTML rendered by Jekyll, then attach behavior with JavaScript.
- Use `pnpm check:js` for JavaScript syntax and lint validation.
- Do not bypass `eslint.config.mjs`; update the config only when the rule change is intentional and justified by the ESLint docs.
- For performance-sensitive interaction, consult the MDN JavaScript performance docs before adding eager work, global listeners, or extra runtime dependencies.

## Templates
- Template guide metadata belongs in `site-src/_data/eureka/template_guide.yml`, `topics.yml`, and `template_languages.yml`.
- Template code bodies belong in `sources/templates/<template-id>/<language>.<extension>`.
- Keep template code minimal and reusable. Do not include package declarations, imports, `#include`, `using namespace`, or `class Solution` boilerplate.
- The Ruby code-source repository validates language coverage and feeds the Jekyll-rendered code collection model. If a new template or language is added, update the source files and the language catalog together.

## Search
- Pagefind is the only site search engine.
- Add searchable content through build-time search records, then rebuild with `pnpm build:indexed-site`.
- Indexed-site builds write Pagefind custom records from the same Jekyll runtime that renders `_site`; do not generate search records from a separate data read when rendered URLs or front matter matter.
- Do not hand-edit `_site/pagefind`; Pagefind runtime assets are generated from the built site.
- Use Pagefind metadata, filters, sorting, and Search API behavior as documented.
- Problem explorer text search must pass active filters to Pagefind. Do not reintroduce query-time DOM text matching or URL-set intersection for searchable problem facets.
- Preserve search accessibility: focus management, Escape behavior, keyboard navigation, dialog semantics, and input/list behavior should follow the linked WAI-ARIA dialog and combobox patterns.

## Playwright CLI
- Use `playwright-cli` for live inspection, reproduction, screenshots, and DOM checks.
- Start the rendered site first with `pnpm preview`.
- Base URL is `http://127.0.0.1:4173`.
- The repo ships `.playwright/cli.config.json`, so the default `playwright-cli` browser config should work without extra setup.
- Open a browser session with `playwright-cli open http://127.0.0.1:4173`.
- Reuse an existing session with `playwright-cli list` and `playwright-cli -s=<session> ...`.
- Preferred commands are `snapshot`, `screenshot`, `console`, `network`, `click`, `hover`, and `eval`.
- Debug rendered pages, not raw Liquid templates. Prefer role/name locators for behavior and data attributes only for structural invariants.
- Use Playwright Test for problem explorer, template guide, flowchart, search, and responsive behavior. Keep Ruby tests focused on pure Ruby builders, repositories, validators, and checks.

## Validation Matrix
- Ruby, scripts, or data registry changes: `pnpm lint:ruby && pnpm test:ruby && pnpm validate:catalogs`.
- Jekyll layouts, includes, Sass, JavaScript, search, SEO, or generated page data changes: `pnpm check:js && pnpm test:site && pnpm check:links`.
- Search UI, problem explorer, template guide, flowchart, or browser interaction changes: `pnpm test:functional`.
- Before handoff after code changes: run `pnpm test:full`, or state exactly why it could not run.
- Do not rely on Ruby tests alone for rendered page behavior.

## GitHub
- Use `gh` for GitHub operations.
- Use conventional commit messages: `type(scope): subject`.
