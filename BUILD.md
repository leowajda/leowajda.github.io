# Build

Jekyll-first personal site.

```
sources/ + site-src/_data
  → SiteKit::Build
  → Liquid
  → HTML
  → Pagefind (+ template hash extras)
```

## Ruby (`lib/site_kit/`)

| File | Role |
|------|------|
| `build.rb` | `pages`, `attach!`, `search_extras`, `validate!` |
| `eureka.rb` | Problem catalog → explorer + pages |
| `templates.rb` | Guide + template code + embeds |
| `source_notes.rb` | Zibaldone tree + docs + embeds |
| `core.rb` | Paths, IO, CodeEntry, errors |
| `catalogs.rb` | Project manifests + app config |
| `jekyll.rb` | SiteLoader, GeneratedPage |
| `emit.rb` | Page hash helper |
| `search.rb` | Template hash Pagefind records |
| `checks.rb` | Catalog / SEO / links / vendor |
| `assets.rb` | Cache-bust versions |

Plugins only call `Build`.

## Contract

**URLs:** `/{base}/…/{id}/` and `…/embed/`; `#fragment` in-page only.

**Code entries:** `entry_id`, `language`, `language_label`, `variant`, `variant_label`, `code`, `code_language`, optional URLs.

**Liquid:** `page.entries`, `page.explorer`, `page.template_guide`, `page.source_*`.

## JS (progressive)

code-collection, copy, embed-resize, pagefind, search, eureka-filters, template-library, theme.

## Gate

`pnpm test:full`
