.PHONY: validate-catalogs check check-js lint-ruby build check-links serve test-ruby test test-functional test-full clean

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

check-links:
	pnpm check:links

serve:
	bundle exec jekyll serve --source site-src --destination _site --host 127.0.0.1 --port 4173 --livereload --livereload-port 35730

test-ruby:
	pnpm test:ruby

test:
	pnpm test:full

test-functional: build
	pnpm test:functional:built

test-full:
	pnpm test:full

clean:
	rm -rf _site node_modules vendor .bundle
