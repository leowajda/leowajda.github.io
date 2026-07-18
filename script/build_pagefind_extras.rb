# frozen_string_literal: true

# Hash-target search entries (templates, flowchart nodes) that HTML crawl cannot express.
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

context = SiteKit::Build::Context.for(site)
factory = SiteKit::Search::RecordFactory.new
records = [
  SiteKit::Search::TemplateRecordBuilder.new(
    guide: context.template_library_context.guide,
    factory: factory
  ),
  SiteKit::Search::FlowchartRecordBuilder.new(
    flowchart: context.flowchart_data,
    summaries: site.data.fetch(SiteKit::EUREKA_NAMESPACE).fetch('flowchart_summaries', {}),
    factory: factory
  )
].flat_map(&:records).map(&:to_h)

FileUtils.mkdir_p(File.dirname(OUTPUT_PATH))
File.write(OUTPUT_PATH, JSON.pretty_generate(records))
puts "Wrote #{records.size} Pagefind extras to #{OUTPUT_PATH}."
