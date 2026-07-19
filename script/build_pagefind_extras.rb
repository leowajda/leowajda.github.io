# frozen_string_literal: true

require 'bundler/setup'
require 'fileutils'
require 'jekyll'
require 'json'
require_relative '../lib/site_kit'

OUTPUT_PATH = File.expand_path('../tmp/pagefind-extras.json', __dir__)
SITE_SOURCE = File.expand_path('../site-src', __dir__)

site = Jekyll::Site.new(
  Jekyll.configuration(
    'source' => SITE_SOURCE,
    'destination' => File.expand_path('../tmp/pagefind-extras-site', __dir__),
    'quiet' => true
  )
)
site.read

runtime = SiteKit::Runtime.for(site)
records = runtime.search_records.map(&:to_h)

FileUtils.mkdir_p(File.dirname(OUTPUT_PATH))
File.write(OUTPUT_PATH, JSON.pretty_generate(records))
puts "Wrote #{records.size} Pagefind extras to #{OUTPUT_PATH}."
