# frozen_string_literal: true

require_relative '../../lib/site_kit'

module SiteKit
  class SiteBuildGenerator < Jekyll::Generator
    safe true
    priority :high

    def generate(site)
      build = SiteKit::Build.for(site)
      build.attach!(site)
      build.pages.each do |page|
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
