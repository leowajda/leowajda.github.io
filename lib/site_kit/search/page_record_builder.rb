# frozen_string_literal: true

module SiteKit
  module Search
    class PageRecordBuilder
      KIND = SiteKit::Search::Contract::KIND_PAGE

      def initialize(pages:)
        @pages = pages
      end

      def records
        pages.select { |page| searchable_page?(page) }.map { |page| page_record(page) }
      end

      private

      attr_reader :pages

      def page_record(page)
        SiteKit::Search::Record.build(
          kind: KIND,
          title: page.data.fetch('title'),
          url: page.url,
          project: project_title(page),
          summary: page.data.fetch('description', ''),
          content: search_content(page),
          priority: page.data.fetch('search_priority', 50)
        )
      end

      def searchable_page?(page)
        page.data['search_record'] == true
      end

      def project_title(page)
        page.data['project_title'] ||
          page.data.dig('browser_record', 'project_title') ||
          page.data.fetch('project_slug', '')
      end

      def search_content(page)
        configured = page.data.fetch('search_content', '').to_s
        return configured unless configured.empty?

        SiteKit::Search::Record.clean_html(page.output || page.content)
      end
    end
  end
end
