# frozen_string_literal: true

module SiteKit
  module Templates
    class LibraryPageContextBuilder
      def initialize(template_guide:, eureka_browsers:, page_link_resolver:)
        @template_guide = template_guide
        @eureka_browsers = eureka_browsers
        @page_link_resolver = page_link_resolver
      end

      def attach(document)
        document.data['template_guide'] = template_guide
        document.data['default_template_target'] = template_guide.fetch('default_target')
        project_slug = document.data.fetch('project_slug')
        document.data['project_title'] ||= eureka_browsers.fetch(project_slug).fetch('project_title')
        document.data['header_links'] = page_link_resolver.links_for('algorithmic_templates')
      end

      private

      attr_reader :template_guide, :eureka_browsers, :page_link_resolver
    end
  end
end
