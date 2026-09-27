# frozen_string_literal: true

require_relative '../../lib/site_kit'

module SiteKit
  class SiteBuildGenerator < Jekyll::Generator
    safe true
    priority :high

    def generate(site)
      SiteKit::Build.clear(site)
      build = SiteKit::Build.for(site)
      attach(site, build)
      build.pages.each do |spec|
        site.pages << generated_page(site, spec)
      end
      SiteKit::Checks::SiteInvariants.new(site: site).validate!
    end

    private

    def generated_page(site, spec)
      content = spec.fetch(:content, '').to_s
      dir = spec.fetch(:dir).delete_prefix('/').delete_suffix('/')
      name = content.strip.empty? ? 'index.html' : 'index.md'
      page = Jekyll::PageWithoutAFile.new(site, site.source, dir, name)
      page.content = content
      page.data.merge!(spec.fetch(:data).transform_keys(&:to_s))
      page
    end

    def attach(site, build)
      documents = site.pages
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
