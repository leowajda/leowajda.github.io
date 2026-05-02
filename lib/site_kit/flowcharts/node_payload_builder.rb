# frozen_string_literal: true

module SiteKit
  module Flowcharts
    class NodePayloadBuilder
      def initialize(flowchart:, incoming_edges_by_target:, topic_registry:, flowchart_summaries:)
        @flowchart = flowchart
        @incoming_edges_by_target = incoming_edges_by_target
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

      attr_reader :flowchart, :incoming_edges_by_target, :topic_registry, :flowchart_summaries

      def flowchart_nodes
        @flowchart_nodes ||= topic_registry.fetch('flowchart_nodes', {})
      end
    end
  end
end
