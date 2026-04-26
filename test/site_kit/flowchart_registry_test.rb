# frozen_string_literal: true

require_relative '../test_helper'

class SiteKitFlowchartRegistryTest < SiteKitTestCase
  def test_builds_incoming_edges_by_target
    registry = build_context.eureka_context.flowcharts.fetch('eureka')
    edge = registry.fetch('incoming_edges_by_target').fetch('directed-graph-topo')

    assert_equal 'directed-graph', edge.fetch('from')
    assert_equal 'yes', edge.fetch('label')
  end

  def test_rejects_duplicate_flowchart_edge_targets
    flowchart = {
      'edges' => [
        { 'from' => 'a', 'to' => 'b', 'path' => 'yes' },
        { 'from' => 'c', 'to' => 'b', 'path' => 'no' }
      ]
    }

    error = assert_raises(RuntimeError) do
      SiteKit::FlowchartRegistry.new(flowchart_data: flowchart).record
    end

    assert_match(/Flowchart edge targets must be unique: b/, error.message)
  end
end
