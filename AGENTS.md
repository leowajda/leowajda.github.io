# AGENTS

## Setup
- Install deps: `pnpm install` and `bundle install`
- Sync submodules only when needed: `pnpm sync:sources`

## Core Commands
- Typecheck: `pnpm typecheck`
- Tool tests: `pnpm test:tools`
- Generate site source: `pnpm generate`
- Preview rendered site: `pnpm preview`

## Preview
- URL: `http://127.0.0.1:4173`
- `pnpm preview` runs the real pipeline: generate -> Jekyll build -> static server
- Prefer `pnpm preview` over `pnpm serve` for debugging and browser automation

## Playwright
- Use the repo Playwright config
- It auto-starts `pnpm preview`
- Base URL is `http://127.0.0.1:4173`
- Use Playwright for live inspection, repro, screenshots, and DOM checks

## Rule
- Debug rendered pages, not raw templates
