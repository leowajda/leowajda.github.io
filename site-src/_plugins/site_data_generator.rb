# frozen_string_literal: true

require_relative '../../lib/site_kit'

module SiteKit
  class SiteDataGenerator < Jekyll::Generator
    safe true
    priority :highest

    def generate(site)
      runtime = SiteKit::Runtime.for(site)
      documents = site.pages + site.collections.fetch('posts').docs

      documents.each do |document|
        case document.data['layout']
        when 'home'
          document.data['home_projects'] = runtime.site_projects
        when 'problems'
          attach_problems(document, runtime)
        when 'template_library'
          attach_templates(document, runtime)
        end
      end
    end

    private

    def attach_problems(document, runtime)
      browser = runtime.eureka.browsers.fetch(document.data.fetch('project_slug'))
      document.data['browser_record'] = browser
    end

    def attach_templates(document, runtime)
      guide = runtime.templates.guide
      document.data['template_guide'] = guide
      document.data['default_template_target'] = guide.fetch('default_target')
      project_slug = document.data.fetch('project_slug')
      document.data['project_title'] ||= runtime.eureka.browsers.fetch(project_slug).fetch('project_title')
    end
  end
end
