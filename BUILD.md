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

## Ruby (`lib/site_kit/`)

| File | Role |
|------|------|
| `build.rb` | `pages`, `search_extras`, `validate!`, domain accessors |
| `invariants.rb` | Catalog rules at validate |
| `eureka.rb` | Problems → explorer + pages |
| `templates.rb` | Topics → code → guide → embeds (+ ReferenceResolver) |
| `source_notes.rb` | Tree scan → docs/entries → pages |
| `core.rb` | Errors, Helpers, Schema, ResourcePaths, CodeEntry |
| `catalogs.rb` | Manifests + app config |
| `jekyll.rb` | SiteLoader, GeneratedPage |
| `emit.rb` | Page hash helper |
| `search.rb` | Template hash Pagefind records |
| `checks.rb` | SEO / links / vendor / site invariants |
| `assets.rb` | Cache-bust versions |

Loaders are single-module files. Plugins call `Build` only; attach runs in `site_build_generator`.

## Code box

```liquid
{% include code_collection.html
  entries=entries
  collection_id='…'
  kind='problem'
  embed=true
  sync_hash=true
  problem_source_url=…
%}
```

Partials: `code_collection_languages.html`, `code_collection_variants.html`.  
Defaults: `site.data.site.app.code_collection` + `eureka.browser`.

## Entries

`entry_id`, `language`, `language_label`, `variant`, `variant_label`, `code`, `code_language`, optional URLs.

## URLs

`/{base}/…/{id}/` · `…/embed/` · `#fragment`

## JS

code-collection, copy, embed-resize, pagefind, search, eureka-filters, template-library, theme.

## Gate

`pnpm test:full`
