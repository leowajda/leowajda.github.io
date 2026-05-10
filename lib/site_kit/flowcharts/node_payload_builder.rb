# frozen_string_literal: true

module SiteKit
  module Flowcharts
    class NodePayloadBuilder
      def initialize(flowchart:, graph_index:, topic_registry:, flowchart_summaries:)
        @flowchart = flowchart
        @graph_index = graph_index
        @topic_registry = topic_registry
        @flowchart_summaries = flowchart_summaries
      end

      def build
        flowchart.fetch('nodes').map do |node|
          node_id = node.fetch('id')
          incoming_edge = incoming_edges_by_target[node_id]

          {
            'node' => node,
            'parent_id' => incoming_edge&.fetch('from', nil),
            'parent_answer' => incoming_edge&.fetch('label', nil),
            'summary' => flowchart_summaries[node_id],
            'template_guide_entrypoints' => flowchart_nodes.fetch(node_id, [])
          }
        end
      end

      private

      attr_reader :flowchart, :graph_index, :topic_registry, :flowchart_summaries

      def incoming_edges_by_target
        graph_index.incoming_edges_by_target
      end

      def flowchart_nodes
        @flowchart_nodes ||= topic_registry.fetch('flowchart_nodes', {})
      end
    end
  end
end
