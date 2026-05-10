# frozen_string_literal: true

module SiteKit
  module Flowcharts
    class X6GraphBuilder
      def initialize(flowchart:, graph_index: nil)
        @graph_index = graph_index || SiteKit::Flowcharts::GraphIndex.new(flowchart: flowchart)
      end

      def build
        graph_index.graph_payload
      end

      private

      attr_reader :graph_index
    end
  end
end
