# frozen_string_literal: true

module SiteKit
  module Flowcharts
    class X6GraphBuilder
      def initialize(flowchart:)
        @flowchart = flowchart
      end

      def build
        {
          'chart' => build_chart,
          'nodes' => nodes.map { |node| build_node(node) },
          'edges' => edges.map { |edge| build_edge(edge) }
        }
      end

      private

      attr_reader :flowchart

      def build_chart
        chart = flowchart.fetch('chart')
        {
          'title' => flowchart.fetch('title'),
          'width' => chart.fetch('width'),
          'height' => chart.fetch('height'),
          'scale_desktop' => chart.fetch('scale_desktop'),
          'scale_mobile' => chart.fetch('scale_mobile')
        }
      end

      def build_node(node)
        {
          'id' => node.fetch('id'),
          'aliases' => Array(node.fetch('aliases', [])),
          'kind' => node.fetch('kind'),
          'text' => node.fetch('text'),
          'label' => node.fetch('canvas_text'),
          'x' => node.fetch('x'),
          'y' => node.fetch('y'),
          'width' => node.fetch('width'),
          'height' => node.fetch('height')
        }
      end

      def build_edge(edge)
        {
          'id' => edge.fetch('id'),
          'from' => edge.fetch('from'),
          'to' => edge.fetch('to'),
          'label' => edge.fetch('label', '')
        }
      end

      def nodes
        @nodes ||= SiteKit::Core::Helpers.ensure_array(flowchart.fetch('nodes'), 'Flowchart data.nodes')
      end

      def edges
        @edges ||= SiteKit::Core::Helpers.ensure_array(flowchart.fetch('edges'), 'Flowchart data.edges')
      end
    end
  end
end
