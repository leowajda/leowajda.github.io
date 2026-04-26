# frozen_string_literal: true

module SiteKit
  class TemplateGuideUrlResolver
    def initialize(page_link_resolver:)
      @page_link_resolver = page_link_resolver
    end

    def url_for(entrypoint)
      target = entrypoint.fetch('target', '')
      return '' if target.empty?

      "#{algorithmic_templates_url}##{target}"
    end

    private

    attr_reader :page_link_resolver

    def algorithmic_templates_url
      @algorithmic_templates_url ||= page_link_resolver.page_link('algorithmic_templates').fetch('url')
    end
  end
end
