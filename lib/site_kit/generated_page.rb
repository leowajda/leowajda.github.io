# frozen_string_literal: true

require 'jekyll'

module SiteKit
  class GeneratedPage < Jekyll::PageWithoutAFile
    def initialize(site:, dir:, page_type:, data:, content: '')
      normalized_dir = dir.delete_prefix('/').delete_suffix('/')
      source_name = content.to_s.strip.empty? ? 'index.html' : 'index.md'
      super(site, site.source, normalized_dir, source_name)

      @page_type = page_type
      self.content = content
      self.data = data.transform_keys(&:to_s)
      self.data.default_proc = proc do |_, key|
        site.frontmatter_defaults.find(relative_path, @page_type, key)
      end
    end

    def type
      @page_type
    end
  end
end
