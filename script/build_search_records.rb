#!/usr/bin/env ruby
# frozen_string_literal: true

require 'bundler/setup'
require 'fileutils'
require 'json'
require 'jekyll'
require_relative '../lib/site_kit'

OUTPUT_PATH = File.expand_path('../tmp/search-records.json', __dir__)

site = SiteKit::JekyllRuntime::SiteLoader.new(destination: File.expand_path('../_site', __dir__)).read

context = SiteKit::Build::Context.for(site)
records = SiteKit::Search::IndexBuilder.new(context:, site:).records.map(&:to_h)

FileUtils.mkdir_p(File.dirname(OUTPUT_PATH))
File.write(OUTPUT_PATH, "#{JSON.pretty_generate(records)}\n")

puts "Wrote #{records.size} Pagefind search records to #{OUTPUT_PATH}."
