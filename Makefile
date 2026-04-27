.PHONY: validate-catalogs check check-js lint-ruby build build-indexed check-seo check-links serve test-ruby test test-functional test-full clean

validate-catalogs:
	pnpm validate:catalogs

check:
	pnpm check:validate

check-js:
	pnpm check:js

lint-ruby:
	pnpm lint:ruby

build:
	pnpm build:site

build-indexed:
	pnpm build:indexed-site

check-links:
	pnpm check:links

check-seo:
	pnpm check:seo

serve:
	pnpm preview

test-ruby:
	pnpm test:ruby

test:
	pnpm test:full

test-functional: build-indexed
	pnpm test:functional:built

test-full:
	pnpm test:full

clean:
	rm -rf _site node_modules vendor .bundle
