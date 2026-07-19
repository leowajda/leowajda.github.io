# frozen_string_literal: true

require_relative '../../lib/site_kit'

module SiteKit
  class GeneratedPagesGenerator < Jekyll::Generator
    safe true
    priority :low

    def generate(site)
      runtime = SiteKit::Runtime.for(site)

      runtime.generated_pages.each do |page|
        site.pages << SiteKit::JekyllRuntime::GeneratedPage.new(
          site: site,
          dir: page.fetch(:dir),
          page_type: page.fetch(:page_type),
          data: page.fetch(:data),
          content: page.fetch(:content, '')
        )
      end

      SiteKit::Checks::SiteInvariants.new(site: site).validate!
    end
  end
end
