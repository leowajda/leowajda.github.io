# frozen_string_literal: true

module SiteKit
  module Flowcharts
    class Registry
      def initialize(flowchart_data:)
        @flowchart_data = flowchart_data
      end

      def record
        @record ||= {
          'incoming_edges_by_target' => incoming_edges_by_target
        }
      end

      private

      attr_reader :flowchart_data

      def incoming_edges_by_target
        SiteKit::Core::Helpers.ensure_array(flowchart_data['edges'],
                                            'Flowchart data.edges').each_with_object({}) do |edge_entry, result|
          edge = SiteKit::Core::Helpers.ensure_hash(edge_entry, 'Flowchart edge')
          target = SiteKit::Core::Helpers.ensure_string(edge.fetch('to'), 'Flowchart edge.to')
          SiteKit::Core::Helpers.ensure_string(edge.fetch('from'), 'Flowchart edge.from')
          raise SiteKit::CatalogError, "Flowchart edge targets must be unique: #{target}" if result.key?(target)

          result[target] = edge
        end
      end
    end
  end
end
