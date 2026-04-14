# AGENTS

## Setup
- Install deps: `pnpm install` and `bundle install`
- Sync submodules only when needed: `pnpm sync:sources`

## Core Commands
- Sync `README.md` symlink to `AGENTS.md`: `pnpm docs:refresh`
- Typecheck: `pnpm typecheck`
- Tool tests: `pnpm test:tools`
- Generate site source: `pnpm generate`
- Preview rendered site: `pnpm preview`

## Preview
- URL: `http://127.0.0.1:4173`
- `pnpm preview` runs the real pipeline, then starts `jekyll serve` with `--livereload`
- Prefer `pnpm preview` over `pnpm serve` for debugging and browser automation

## Styling
- For styling-related work, treat `styles/` as the styling source of truth and start from [styles/main.css](/home/leowajda/Projects/leowajda.github.io/styles/main.css:1)
- Keep theme markup aligned with [packages/theme/src](/home/leowajda/Projects/leowajda.github.io/packages/theme/src:1) and do not scatter one-off styling logic into unrelated templates or scripts
- The site styling is Tailwind-based; keep CSS inside the Tailwind entrypoint and `@layer` structure, and prefer existing utilities / `@apply` over introducing a parallel styling system
- Preserve a Jekyll-first approach for UI work: prefer layouts, includes, Liquid, `site.data`, and front matter over client-side assembly

## Playwright CLI
- Use `playwright-cli` for live inspection, repro, screenshots, and DOM checks
- Start the rendered site first with `pnpm preview`
- Base URL is `http://127.0.0.1:4173`
- The repo ships `.playwright/cli.config.json`, so the default `playwright-cli` browser config should work without extra setup
- Open a browser session with `playwright-cli open http://127.0.0.1:4173`
- Reuse an existing session with `playwright-cli list` and `playwright-cli -s=<session> ...`
- Preferred commands for checks are `snapshot`, `screenshot`, `console`, `network`, `click`, `hover`, and `eval`

## Rule
- Debug rendered pages, not raw templates
- Use `gh` for all GitHub operations, including pull requests and related repository workflows
- Use conventional commit messages: `type(scope): subject`
