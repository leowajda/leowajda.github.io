# Build

Jekyll-first personal site.

```
sources/ + site-src/_data
  → SiteKit::Build (load, validate, emit pages, attach data)
  → Liquid
  → HTML
  → Pagefind (+ template hash extras only)
```

## Layout

| Path | Role |
|------|------|
| `lib/site_kit.rb` | Requires |
| `lib/site_kit/build.rb` | Public API: `pages`, `attach!`, `search_extras`, `validate!` |
| `lib/site_kit/eureka.rb` | Problems + explorer |
| `lib/site_kit/templates.rb` | Template guide + code bodies |
| `lib/site_kit/source_notes.rb` | Zibaldone tree + docs |
| `lib/site_kit/core.rb` | Paths, IO, validation, code entries |
| `lib/site_kit/catalogs.rb` | Project manifests |
| `lib/site_kit/checks.rb` | Post-build / catalog checks |
| `lib/site_kit/jekyll.rb` | SiteLoader + GeneratedPage |
| `lib/site_kit/search.rb` | Pagefind hash extras |
| `site-src/_plugins/` | Thin generators only |

## URLs

```
/{base}/…/{id}/
/{base}/…/{id}/embed/
#fragment
```

## Code entries

`entry_id`, `language`, `language_label`, `variant`, `variant_label`, `code`, `code_language`, optional `source_url` / `detail_url` / `embed_url`.

Liquid always receives `entries`. Explorer data is `page.explorer`.

## JS

Progressive only: code switcher, copy, embed resize, Pagefind search, Pagefind explorer filters, theme.
