# frozen_string_literal: true

require 'fileutils'
require 'json'
require_relative '../../lib/site_kit'

module SiteKit
  class PagefindExtrasGenerator < Jekyll::Generator
    safe true
    priority :lowest

    OUTPUT_PATH = File.expand_path('../../tmp/pagefind-extras.json', __dir__)

    def generate(site)
      records = SiteKit::Build.for(site).search_extras.map(&:to_h)
      FileUtils.mkdir_p(File.dirname(OUTPUT_PATH))
      File.write(OUTPUT_PATH, JSON.pretty_generate(records))
    end
  end
end
