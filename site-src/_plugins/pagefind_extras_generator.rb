# frozen_string_literal: true

require 'fileutils'
require 'json'
require_relative '../../lib/site_kit'

module SiteKit
  # Writes Pagefind hash-target extras during the main Jekyll build (one pass).
  class PagefindExtrasGenerator < Jekyll::Generator
    safe true
    priority :lowest

    OUTPUT_PATH = File.expand_path('../../tmp/pagefind-extras.json', __dir__)

    def generate(site)
      runtime = SiteKit::Runtime.for(site)
      records = runtime.search_records.map(&:to_h)
      FileUtils.mkdir_p(File.dirname(OUTPUT_PATH))
      File.write(OUTPUT_PATH, JSON.pretty_generate(records))
    end
  end
end
