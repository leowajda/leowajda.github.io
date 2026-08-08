# Build

Jekyll-first personal site.

```
sources/ + site-src/_data
  → SiteKit::Build
  → generators attach data + emit pages
  → Liquid
  → HTML
  → Pagefind (+ template hash extras)
```

## Ruby

| File | Role |
|------|------|
| `build.rb` | `pages`, `search_extras`, `validate!`, domain accessors |
| `invariants.rb` | Catalog rules checked at validate |
| `eureka.rb` | Problems → explorer + pages |
| `templates.rb` | Guide + code + embeds |
| `source_notes.rb` | Zibaldone tree + docs + embeds |
| `core.rb` | Paths, IO, CodeEntry, errors |
| `catalogs.rb` | Manifests + app config |
| `jekyll.rb` | SiteLoader, GeneratedPage |
| `emit.rb` | Page hash helper |
| `search.rb` | Template hash Pagefind records |
| `checks.rb` | SEO / links / vendor / site invariants |
| `assets.rb` | Cache-bust versions |

Plugins call `Build` only. Attach runs in `site_build_generator`.

## Code box (Liquid)

```liquid
{% include code_collection.html
  entries=entries
  collection_id='…'
  kind='problem'   # optional; fixed Approach variants
  embed=true       # optional
  sync_hash=true   # optional
  problem_source_url=…  # optional
%}
```

Defaults come from `site.data.site.app.code_collection` and `eureka.browser`.

## Entries

`entry_id`, `language`, `language_label`, `variant`, `variant_label`, `code`, `code_language`, optional URLs.

## URLs

`/{base}/…/{id}/` · `…/embed/` · `#fragment`

## JS

Progressive: code-collection, copy, embed-resize, pagefind, search (dialog+combobox), eureka-filters, template-library, theme.

## Gate

`pnpm test:full`
