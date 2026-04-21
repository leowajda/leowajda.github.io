# frozen_string_literal: true

require_relative "../test_helper"

class SiteKitFlowchartRegistryTest < SiteKitTestCase
  def test_builds_incoming_edges_by_target
    registry = build_context.eureka_context.flowcharts.fetch("eureka")
    edge = registry.fetch("incoming_edges_by_target").fetch("directed-graph-topo")

    assert_equal "directed-graph", edge.fetch("from")
    assert_equal "yes", edge.fetch("label")
  end
end
