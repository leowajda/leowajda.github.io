# frozen_string_literal: true

module SiteKit
  module Flowcharts
    class PageContextBuilder
      def initialize(eureka_browsers:, eureka_topics:, flowchart_record:, flowchart_summaries:, page_link_resolver:)
        @eureka_browsers = eureka_browsers
        @eureka_topics = eureka_topics
        @flowchart_record = flowchart_record
        @flowchart_summaries = flowchart_summaries
        @page_link_resolver = page_link_resolver
      end

      def attach(document)
        project_slug = document.data.fetch('project_slug')
        browser = eureka_browsers.fetch(project_slug)
        topic_registry = eureka_topics.fetch(project_slug)

        document.data['project_title'] ||= browser.fetch('project_title')
        document.data['header_links'] = page_link_resolver.links_for('algorithmic_flowchart')
        document.data['flowchart_canvas'] = SiteKit::Compile::Flowchart.canvas(
          laid_out: flowchart_record,
          summaries: flowchart_summaries,
          flowchart_nodes: topic_registry.fetch('flowchart_nodes', {}),
          templates_url: page_link_resolver.page_link('algorithmic_templates').fetch('url')
        )
      end

      private

      attr_reader :eureka_browsers, :eureka_topics, :flowchart_record, :flowchart_summaries, :page_link_resolver
    end
  end
end
