# frozen_string_literal: true

require_relative '../../lib/site_kit'

module SiteKit
  class SiteBuildGenerator < Jekyll::Generator
    safe true
    priority :high

    def generate(site)
      build = SiteKit::Build.for(site)
      attach(site, build)
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

    private

    def attach(site, build)
      documents = site.pages + site.collections.fetch('posts').docs
      documents.each do |document|
        case document.data['layout']
        when 'home'
          document.data['home_projects'] = build.home_projects
        when 'problems'
          document.data['explorer'] = build.explorer(document.data.fetch('project_slug'))
        when 'template_library'
          guide = build.guide
          document.data['template_guide'] = guide
          document.data['default_template_target'] = guide.fetch('default_target')
          slug = document.data.fetch('project_slug')
          document.data['project_title'] ||= build.explorer(slug).fetch('project_title')
        end
      end
    end
  end
end
