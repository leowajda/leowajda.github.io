# frozen_string_literal: true

module SiteKit
  class FlowchartPageContextBuilder
    def initialize(eureka_browsers:, eureka_topics:, flowcharts:, flowchart_record:, flowchart_summaries:,
                   page_link_resolver:)
      @eureka_browsers = eureka_browsers
      @eureka_topics = eureka_topics
      @flowcharts = flowcharts
      @flowchart_record = flowchart_record
      @flowchart_summaries = flowchart_summaries
      @page_link_resolver = page_link_resolver
    end

    def attach(document)
      project_slug = document.data.fetch('project_slug')
      browser = eureka_browsers.fetch(project_slug)
      registry = flowcharts.fetch(project_slug)
      topic_registry = eureka_topics.fetch(project_slug)
      validate_flowchart_summaries!

      document.data['project_title'] ||= browser.fetch('project_title')
      document.data['header_links'] = page_link_resolver.links_for('algorithmic_flowchart')
      document.data['flowchart_canvas'] = {
        'flowchart' => flowchart_record,
        'templates_url' => page_link_resolver.page_link('algorithmic_templates').fetch('url'),
        'node_payloads' => FlowchartNodePayloadBuilder.new(
          flowchart: flowchart_record,
          incoming_edges_by_target: registry.fetch('incoming_edges_by_target', {}),
          topic_registry: topic_registry,
          flowchart_summaries: flowchart_summaries
        ).build
      }
    end

    private

    attr_reader :eureka_browsers, :eureka_topics, :flowcharts, :flowchart_record, :flowchart_summaries,
                :page_link_resolver

    def validate_flowchart_summaries!
      node_ids = Helpers.ensure_array(flowchart_record.fetch('nodes'), 'Flowchart data.nodes').map do |node|
        Helpers.ensure_hash(node, 'Flowchart node').fetch('id')
      end
      unknown_summary_ids = flowchart_summaries.keys - node_ids
      return if unknown_summary_ids.empty?

      raise "Flowchart summaries reference unknown node ids: #{unknown_summary_ids.join(', ')}"
    end
  end
end
