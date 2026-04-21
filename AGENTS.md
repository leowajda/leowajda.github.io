# AGENTS

## Setup
- Install Ruby dependencies with `bundle install`.
- Install Node dependencies with `pnpm install` only when the task needs Playwright or browser automation.
- Sync submodules with `pnpm sync:sources` only when the task needs them.

## Core Commands
- Sync the `README.md` symlink to `AGENTS.md`: `pnpm docs:refresh`
- Syntax-check the source validation script: `ruby -c script/validate_catalogs.rb`
- Validate source catalogs and generated registries: `ruby script/validate_catalogs.rb`
- Build the site: `bundle exec jekyll build --source site-src --destination _site`
- Run Ruby tests: `pnpm test:ruby`
- Validate catalogs, then build: `make test`
- Preview the rendered site: `bundle exec jekyll serve --source site-src --destination _site --host 127.0.0.1 --port 4173 --livereload --livereload-port 35730`

## Preview
- Base URL: `http://127.0.0.1:4173`
- `pnpm preview` and `make serve` render the committed `site-src` tree directly.
- `ruby script/validate_catalogs.rb` is separate from preview and build. It validates source catalogs and generated registries without writing files.
- Debug rendered pages, not raw templates.

## Design
- Read [DESIGN.md](DESIGN.md) before any UI, navigation, interaction, or copy change.
- `DESIGN.md` is the authoritative source of truth for the site's philosophy, writing, and interface rules.
- The writing bar is not optional: Feynman clarity, Einstein-level explanation, Hemingway simplicity, Caesar's concision.
- Do not waste the reader's time. If a heading already says it, the body must move forward instead of repeating it.

## Playwright CLI
- Use `playwright-cli` for live inspection, reproduction, screenshots, and DOM checks.
- Start the rendered site first with `pnpm preview`.
- Base URL is `http://127.0.0.1:4173`.
- The repo ships `.playwright/cli.config.json`, so the default `playwright-cli` browser config should work without extra setup.
- Open a browser session with `playwright-cli open http://127.0.0.1:4173`.
- Reuse an existing session with `playwright-cli list` and `playwright-cli -s=<session> ...`.
- Preferred commands are `snapshot`, `screenshot`, `console`, `network`, `click`, `hover`, and `eval`.

## Rules
- Keep site work Jekyll-first. Prefer layouts, includes, Liquid, `site.data`, and front matter over client-side assembly.
- For style changes, treat `site-src/assets/css` and `site-src/_sass` as the styling source of truth.
- Use `gh` for all GitHub operations.
- Use conventional commit messages: `type(scope): subject`.
