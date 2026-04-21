validate-catalogs:
	ruby script/validate_catalogs.rb

check:
	ruby -c script/validate_catalogs.rb

build:
	bundle exec jekyll build --source site-src --destination _site

serve:
	bundle exec jekyll serve --source site-src --destination _site --host 127.0.0.1 --port 4173 --livereload --livereload-port 35730

test: validate-catalogs
	bundle exec jekyll build --source site-src --destination _site

clean:
	rm -rf _site node_modules vendor .bundle
