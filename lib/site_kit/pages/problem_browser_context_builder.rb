# frozen_string_literal: true

module SiteKit
  module Pages
    class ProblemBrowserContextBuilder
      def initialize(eureka_browsers:, page_link_resolver:)
        @eureka_browsers = eureka_browsers
        @page_link_resolver = page_link_resolver
      end

      def attach(document)
        browser = eureka_browsers.fetch(document.data.fetch('project_slug'))
        active_language = active_language_record(browser, document.data['language_filter'])

        document.data['browser_record'] = browser
        document.data['active_language_record'] = active_language if active_language
        document.data['header_links'] = page_link_resolver.links_for('problem_explorer')
        document.data['problem_filter_panel'] = SiteKit::Eureka::FilterPanelBuilder.new(
          browser: browser,
          active_language: active_language
        ).build
        document.data['problem_table'] = SiteKit::Eureka::ProblemTableBuilder.new(
          browser: browser,
          active_language: active_language
        ).build
      end

      private

      attr_reader :eureka_browsers, :page_link_resolver

      def active_language_record(browser, language_filter)
        return nil if language_filter.to_s.empty?

        browser.fetch('languages').find { |language| language.fetch('slug') == language_filter }
      end
    end
  end
end
