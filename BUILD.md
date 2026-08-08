# Build

Jekyll-first personal site. One pipe:

```
sources/ + site-src/_data
  → generators (load, validate, emit pages, attach data)
  → Liquid
  → HTML
  → Pagefind (+ template hash extras only)
```

## URLs

```
/{base}/…/{id}/
/{base}/…/{id}/embed/
#fragment
```

## Code entries

Every code box uses `entries[]`:

`entry_id`, `language`, `language_label`, `variant`, `variant_label`, `code`, `code_language`, optional `source_url` / `detail_url` / `embed_url`.

## JS allowlist

- code language/variant PE
- copy
- embed resize
- Pagefind search overlay
- Pagefind explorer filters
- theme

## API

`SiteKit::Build.for(site)` → `pages`, `attach!(site)`, `search_extras`, `validate!`
