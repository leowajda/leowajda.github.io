# AGENTS

## Setup
- Install Ruby deps: `bundle install`
- Install Node deps only if you need Playwright or browser automation: `pnpm install`
- Sync submodules only when needed: `pnpm sync:sources`

## Core Commands
- Sync `README.md` symlink to `AGENTS.md`: `pnpm docs:refresh`
- Check the Ruby refresh script syntax: `ruby -c script/refresh_data.rb`
- Refresh generated site data/assets: `ruby script/refresh_data.rb`
- Backwards-compatible aliases: `pnpm refresh:data` and `pnpm generate`
- Build the site with Jekyll: `bundle exec jekyll build --source site-src --destination _site`
- Refresh generated data and build the site: `make test`
- Preview rendered site: `bundle exec jekyll serve --source site-src --destination _site --host 127.0.0.1 --port 4173 --livereload --livereload-port 35730`

## Preview
- URL: `http://127.0.0.1:4173`
- `pnpm preview` and `make serve` both serve the committed `site-src` tree directly with `jekyll serve --livereload`
- `ruby script/refresh_data.rb` is separate from preview/build and only updates generated `_data` and generated assets
- Prefer the rendered Jekyll preview over opening raw templates for debugging and browser automation

## Styling
- For styling-related work, treat `site-src/assets/css` and `site-src/_sass` as the styling source of truth
- Keep theme markup aligned directly in `site-src`
- The site styling is Jekyll-native Sass now; prefer semantic theme classes and shared partials over utility-class authoring or external CSS build steps
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
