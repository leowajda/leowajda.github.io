# frozen_string_literal: true

module SiteKit
  module Pages
    class ProblemBrowserContextBuilder
      def initialize(eureka_browsers:, page_link_resolver:)
        @eureka_browsers = eureka_browsers
        @page_link_resolver = page_link_resolver
      end

      def attach(document)
        document.data['browser_record'] = eureka_browsers.fetch(document.data.fetch('project_slug'))
        document.data['header_links'] = page_link_resolver.links_for('problem_explorer')
      end

      private

      attr_reader :eureka_browsers, :page_link_resolver
    end
  end
end
