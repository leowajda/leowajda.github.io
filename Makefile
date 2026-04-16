refresh-data:
	ruby script/refresh_data.rb

generate:
	ruby script/refresh_data.rb

check:
	ruby -c script/refresh_data.rb

build:
	bundle exec jekyll build --source site-src --destination _site

serve:
	bundle exec jekyll serve --source site-src --destination _site --host 127.0.0.1 --port 4173 --livereload --livereload-port 35730

test:
	ruby script/refresh_data.rb
	bundle exec jekyll build --source site-src --destination _site

clean:
	rm -rf _site node_modules vendor .bundle
	rm -rf site-src/.generated-files.json
	rm -rf site-src/_data/generated
	rm -rf site-src/assets/generated
