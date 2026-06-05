# frozen_string_literal: true

require_relative '../../lib/site_kit'

module SiteKit
  class SiteDataGenerator < Jekyll::Generator
    safe true
    priority :highest

    def generate(site)
      SiteKit::Pages::ContextRegistry.new(
        site: site,
        build: SiteKit::Build::Context.for(site)
      ).attach_to(authored_documents(site))
    end

    private

    def authored_documents(site)
      site.pages + site.collections.fetch('posts').docs
    end
  end
end
