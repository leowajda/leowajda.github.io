# frozen_string_literal: true

module SiteKit
  module Flowcharts
    class Registry
      def initialize(flowchart_data:)
        @flowchart_data = flowchart_data
      end

      def record
        @record ||= {
          'incoming_edges_by_target' => graph_index.incoming_edges_by_target
        }
      end

      private

      attr_reader :flowchart_data

      def graph_index
        @graph_index ||= SiteKit::Flowcharts::GraphIndex.new(flowchart: flowchart_data)
      end
    end
  end
end
