#!/usr/bin/env ruby
# frozen_string_literal: true

require 'bundler/setup'
require 'jekyll'
require_relative '../lib/site_kit'

OUTPUT_PATH = File.expand_path('../tmp/search-records.json', __dir__)
SITE_PATH = File.expand_path('../_site', __dir__)

records = SiteKit::Build::SearchRecordExporter.new(
  destination: SITE_PATH,
  output_path: OUTPUT_PATH
).export

puts "Wrote #{records.size} Pagefind search records to #{OUTPUT_PATH}."
