# frozen_string_literal: true

module SiteKit
  class TemplateLibraryPageContextBuilder
    def initialize(template_groups:, eureka_browsers:, page_link_resolver:)
      @template_groups = template_groups
      @eureka_browsers = eureka_browsers
      @page_link_resolver = page_link_resolver
    end

    def attach(document)
      document.data["template_groups"] = template_groups
      document.data["project_title"] ||= eureka_browsers.fetch(document.data.fetch("project_slug")).fetch("project_title")
      document.data["header_links"] = page_link_resolver.links_for("algorithmic_templates")
    end

    private

    attr_reader :template_groups, :eureka_browsers, :page_link_resolver
  end
end
