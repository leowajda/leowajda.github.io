# frozen_string_literal: true

require_relative '../../test_helper'

class SiteKitFlowchartRegistryTest < SiteKitTestCase
  NODE_GEOMETRY_KEYS = %w[x y width height].freeze
  EDGE_GEOMETRY_KEYS = %w[path label_x label_y].freeze

  def test_flowchart_source_keeps_geometry_generated
    source = build_site.data.fetch('eureka').fetch('flowchart')

    assert_empty(source.fetch('nodes').flat_map { |node| NODE_GEOMETRY_KEYS & node.keys })
    assert_empty(source.fetch('edges').flat_map { |edge| EDGE_GEOMETRY_KEYS & edge.keys })
    assert(source.fetch('nodes').all? { |node| node.fetch('layout').key?('column') && node.fetch('layout').key?('row') })
  end

  def test_flowchart_source_keeps_content_structured
    source = build_site.data.fetch('eureka').fetch('flowchart')

    assert_empty(source.fetch('nodes').select { |node| node.key?('details_html') })
    assert_empty(source.fetch('nodes').map { |node| node.fetch('id') }.grep(%r{/|contraints|huh|twopointers}))
    assert_includes source.fetch('nodes').find { |node| node.fetch('id') == 'maximum-minimum-dp' }.fetch('aliases'),
                    'max/min-dp'
  end

  def test_layout_builder_generates_renderable_geometry
    flowchart = build_context.flowchart_data
    node = flowchart.fetch('nodes').find { |entry| entry.fetch('id') == 'graph-small-constraints-bfs' }
    edge = flowchart.fetch('edges').find { |entry| entry.fetch('id') == 'graph-small-constraints-bfs-no' }

    assert_equal 900, node.fetch('x')
    assert_equal 2000, node.fetch('y')
    assert_operator flowchart.dig('chart', 'height'), :>, 7800
    assert_match(/\AM\d+(\.\d+)?,\d+(\.\d+)? C/, edge.fetch('path'))
    assert edge.key?('label_x')
    assert edge.key?('label_y')
  end

  def test_layout_builder_rejects_hand_authored_node_geometry
    source = {
      'chart' => { 'width' => 100 },
      'nodes' => [
        { 'id' => 'a', 'kind' => 'decision', 'label' => 'A', 'title' => 'A',
          'layout' => { 'column' => 'main', 'row' => 0 }, 'x' => 100 }
      ],
      'edges' => []
    }

    error = assert_raises(SiteKit::Error) do
      SiteKit::Flowcharts::LayoutBuilder.new(flowchart_data: source).build
    end

    assert_match(/defines generated geometry: x/, error.message)
  end

  def test_layout_builder_rejects_hand_authored_edge_geometry
    source = {
      'chart' => { 'width' => 100 },
      'nodes' => [
        { 'id' => 'a', 'kind' => 'decision', 'label' => 'A', 'title' => 'A',
          'layout' => { 'column' => 'main', 'row' => 0 } },
        { 'id' => 'b', 'kind' => 'solution', 'label' => 'B', 'title' => 'B',
          'layout' => { 'column' => 'decision', 'row' => 1 } }
      ],
      'edges' => [
        { 'id' => 'a-b', 'from' => 'a', 'to' => 'b', 'label' => 'yes', 'path' => 'M0,0' }
      ]
    }

    error = assert_raises(SiteKit::Error) do
      SiteKit::Flowcharts::LayoutBuilder.new(flowchart_data: source).build
    end

    assert_match(/defines generated geometry: path/, error.message)
  end

  def test_layout_builder_rejects_legacy_node_ids
    source = {
      'chart' => { 'width' => 100 },
      'nodes' => [
        { 'id' => 'max/min-dp', 'kind' => 'solution', 'label' => 'DP', 'title' => 'DP',
          'layout' => { 'column' => 'main', 'row' => 0 } }
      ],
      'edges' => []
    }

    error = assert_raises(SiteKit::Error) do
      SiteKit::Flowcharts::LayoutBuilder.new(flowchart_data: source).build
    end

    assert_match(%r{use aliases for legacy ids: max/min-dp}, error.message)
  end

  def test_layout_builder_rejects_duplicate_node_aliases
    source = {
      'chart' => { 'width' => 100 },
      'nodes' => [
        { 'id' => 'a', 'aliases' => ['legacy'], 'kind' => 'decision', 'label' => 'A', 'title' => 'A',
          'layout' => { 'column' => 'main', 'row' => 0 } },
        { 'id' => 'b', 'aliases' => ['legacy'], 'kind' => 'solution', 'label' => 'B', 'title' => 'B',
          'layout' => { 'column' => 'decision', 'row' => 1 } }
      ],
      'edges' => []
    }

    error = assert_raises(SiteKit::Error) do
      SiteKit::Flowcharts::LayoutBuilder.new(flowchart_data: source).build
    end

    assert_match(/ids and aliases must be unique: legacy/, error.message)
  end

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

    error = assert_raises(SiteKit::Error) do
      SiteKit::Flowcharts::Registry.new(flowchart_data: flowchart).record
    end

    assert_match(/Flowchart edge targets must be unique: b/, error.message)
  end

  def test_flowchart_nodes_do_not_overlap
    nodes = build_context.flowchart_data.fetch('nodes')
    overlaps = nodes.combination(2).filter_map do |left, right|
      [left.fetch('id'), right.fetch('id')] if rectangles_overlap?(left, right)
    end

    assert_empty overlaps
  end

  def test_expanded_graph_and_rank_branches_have_vertical_room
    nodes = build_context.flowchart_data.fetch('nodes').to_h do |node|
      [node.fetch('id'), node]
    end
    graph_branch_bottom = %w[
      graph-small-constraints-bfs
      graph-small-constraints-graph-bfs
      graph-small-constraints-grid-bfs
    ].map { |id| node_bottom(nodes.fetch(id)) }.max

    assert_operator nodes.fetch('kth-smallest').fetch('y') - graph_branch_bottom, :>=, 500
  end

  private

  def rectangles_overlap?(left, right)
    left.fetch('x') < node_right(right) &&
      node_right(left) > right.fetch('x') &&
      left.fetch('y') < node_bottom(right) &&
      node_bottom(left) > right.fetch('y')
  end

  def node_right(node)
    node.fetch('x') + node.fetch('width')
  end

  def node_bottom(node)
    node.fetch('y') + node.fetch('height')
  end
end
