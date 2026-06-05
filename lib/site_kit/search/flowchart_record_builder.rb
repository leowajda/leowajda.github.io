# frozen_string_literal: true

module SiteKit
  module Search
    class FlowchartRecordBuilder
      KIND = SiteKit::Search::Contract::KIND_FLOWCHART
      PAGE_URL = '/writing/algorithmic-flowchart/'

      def initialize(flowchart:, summaries:)
        @flowchart = flowchart
        @summaries = summaries
      end

      def records
        graph_index.node_by_id.values.map do |node|
          node_record(node, summaries.fetch(node.fetch('id'), {}))
        end
      end

      private

      attr_reader :flowchart, :summaries

      def graph_index
        @graph_index ||= SiteKit::Flowcharts::GraphIndex.new(flowchart: flowchart)
      end

      def node_record(node, summary)
        title = node_display_text(node)

        SiteKit::Search::Record.build(
          kind: KIND,
          title:,
          url: "#{PAGE_URL}##{node.fetch('id')}",
          project: 'Eureka',
          summary: node_display_text(node),
          content: node_content(node, title, summary),
          filters: { SiteKit::Search::Contract::FILTER_FLOWCHART_KIND => node.fetch('kind') },
          meta: { 'target' => node.fetch('id'), 'section' => section_for(node, title) },
          priority: node.fetch('kind') == 'solution' ? 80 : 60
        )
      end

      def node_content(node, title, summary)
        [
          node.fetch('id'),
          node.fetch('aliases', []),
          node.fetch('kind'),
          node_display_text(node),
          node.fetch('canvas_text'),
          node.fetch('search_title'),
          title,
          ancestor_labels(node),
          summary_text(summary),
          node.fetch('references', []).map { |reference| reference.fetch('title', '') }
        ]
      end

      def summary_text(summary)
        return '' unless summary.is_a?(Hash)

        SiteKit::Search::Record.clean_text(summary.values)
      end

      def section_for(node, title)
        parts = []
        parts << duplicate_context(node) if duplicate_title?(title)
        parts << node.fetch('kind').capitalize
        parts.join(' / ')
      end

      def duplicate_title?(title)
        nodes_by_title.fetch(title, []).size > 1
      end

      def duplicate_context(node)
        duplicates = nodes_by_title.fetch(node_title(node))
        (1..ancestor_labels(node).length).each do |length|
          suffix = ancestor_labels(node).last(length)
          next if suffix.empty?

          duplicate_suffixes = duplicates.map { |candidate| ancestor_labels(candidate).last(length) }
          return suffix.join(' / ') if duplicate_suffixes.count(suffix) == 1
        end

        ancestor_labels(node).last
      end

      def ancestor_labels(node)
        ancestors_for(node).map { |ancestor| context_title(ancestor) }
      end

      def ancestors_for(node)
        ancestors = []
        current = node
        while (edge = incoming_edges_by_target[current.fetch('id')])
          current = nodes_by_id.fetch(edge.fetch('from'))
          ancestors.unshift(current)
        end
        ancestors
      end

      def node_title(node)
        node_display_text(node)
      end

      def context_title(node)
        node.fetch('search_title', node_display_text(node))
      end

      def node_display_text(node)
        node.fetch('text')
      end

      def nodes_by_title
        @nodes_by_title ||= flowchart.fetch('nodes').group_by { |node| node_title(node) }
      end

      def nodes_by_id
        graph_index.node_by_id
      end

      def incoming_edges_by_target
        graph_index.incoming_edges_by_target
      end
    end
  end
end
