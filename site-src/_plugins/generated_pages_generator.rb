# frozen_string_literal: true

require_relative '../../lib/site_kit'

module SiteKit
  class GeneratedPagesGenerator < Jekyll::Generator
    safe true
    priority :low

    def generate(site)
      context = SiteKit::Build::Context.for(site)

      context.generated_pages.each do |page_definition|
        site.pages << SiteKit::JekyllRuntime::GeneratedPage.new(site: site, **page_definition.to_h)
      end

      SiteKit::Checks::SiteInvariants.new(site: site).validate!
    end
  end
end
