# frozen_string_literal: true

module SiteKit
  class ProblemBrowserPageContextBuilder
    def initialize(eureka_browsers:, page_link_resolver:)
      @eureka_browsers = eureka_browsers
      @page_link_resolver = page_link_resolver
    end

    def attach(document)
      browser = eureka_browsers.fetch(document.data.fetch("project_slug"))
      active_language = active_language_record(browser, document.data["language_filter"])

      document.data["browser_record"] = browser
      document.data["active_language_record"] = active_language if active_language
      document.data["header_links"] = page_link_resolver.links_for("problem_explorer")
      document.data["problem_filter_panel"] = ProblemFilterPanelBuilder.new(
        browser: browser,
        active_language: active_language,
        site_pages: page_link_resolver_links
      ).build
      document.data["problem_table"] = ProblemTableBuilder.new(
        browser: browser,
        active_language: active_language
      ).build
    end

    private

    attr_reader :eureka_browsers, :page_link_resolver

    def page_link_resolver_links
      {
        "algorithmic_flowchart" => page_link_resolver.page_link("algorithmic_flowchart"),
        "algorithmic_templates" => page_link_resolver.page_link("algorithmic_templates")
      }
    end

    def active_language_record(browser, language_filter)
      return nil if language_filter.to_s.empty?

      browser.fetch("languages").find { |language| language.fetch("slug") == language_filter }
    end
  end
end
