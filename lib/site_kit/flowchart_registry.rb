# frozen_string_literal: true

module SiteKit
  class FlowchartRegistry
    def initialize(flowchart_data:)
      @flowchart_data = flowchart_data
    end

    def record
      @record ||= {
        "incoming_edges_by_target" => incoming_edges_by_target
      }
    end

    private

    attr_reader :flowchart_data

    def incoming_edges_by_target
      Helpers.ensure_array(flowchart_data["edges"], "Flowchart data.edges").each_with_object({}) do |edge_entry, result|
        edge = Helpers.ensure_hash(edge_entry, "Flowchart edge")
        result[Helpers.ensure_string(edge["to"], "Flowchart edge.to")] = edge
      end
    end
  end
end
