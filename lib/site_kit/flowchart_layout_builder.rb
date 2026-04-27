# frozen_string_literal: true

module SiteKit
  class FlowchartLayoutBuilder
    NODE_GEOMETRY_KEYS = %w[x y width height].freeze
    EDGE_GEOMETRY_KEYS = %w[path label_x label_y].freeze
    DEFAULT_COLUMNS = {
      'main' => 100,
      'decision' => 500,
      'secondary' => 900,
      'secondary-branch' => 1250,
      'tertiary' => 1300,
      'quaternary' => 1550
    }.freeze
    ROW_UNIT = 100
    DECISION_SIZE = 200
    SOLUTION_HEIGHT = 74.7969
    SOLUTION_MIN_WIDTH = 96
    SOLUTION_LABEL_PADDING = 68
    SOLUTION_CHARACTER_WIDTH = 9
    CHART_BOTTOM_PADDING = 250

    def initialize(flowchart_data:)
      @flowchart_data = flowchart_data
    end

    def build
      nodes = source_nodes.map { |node| build_node(node) }
      node_index = nodes.to_h { |node| [node.fetch('id'), node] }

      flowchart_data.merge(
        'chart' => build_chart(nodes),
        'nodes' => nodes,
        'edges' => source_edges.map { |edge| build_edge(edge, node_index) }
      )
    end

    private

    attr_reader :flowchart_data

    def build_chart(nodes)
      chart = source_chart.except('height')
      chart.merge('height' => chart_height(nodes))
    end

    def build_node(source_node)
      validate_node_source!(source_node)

      layout = source_node.fetch('layout')
      node = source_node.except('layout')
      node.merge(
        'x' => column_x(layout),
        'y' => row_y(layout),
        'width' => node_width(source_node),
        'height' => node_height(source_node)
      )
    end

    def build_edge(source_edge, node_index)
      validate_edge_source!(source_edge)

      from = node_index.fetch(source_edge.fetch('from'))
      to = node_index.fetch(source_edge.fetch('to'))

      source_edge.merge(FlowchartEdgeRouter.new(from:, to:).attributes)
    end

    def validate_node_source!(node)
      generated_keys = NODE_GEOMETRY_KEYS & node.keys
      return if generated_keys.empty?

      raise "Flowchart node '#{node.fetch('id', '(unknown)')}' defines generated geometry: #{generated_keys.join(', ')}"
    end

    def validate_edge_source!(edge)
      generated_keys = EDGE_GEOMETRY_KEYS & edge.keys
      return if generated_keys.empty?

      raise "Flowchart edge '#{edge.fetch('id', '(unknown)')}' defines generated geometry: #{generated_keys.join(', ')}"
    end

    def column_x(layout)
      columns.fetch(layout.fetch('column'))
    end

    def row_y(layout)
      normalize_number(layout.fetch('row') * ROW_UNIT)
    end

    def node_width(node)
      return DECISION_SIZE if node.fetch('kind') == 'decision'

      [
        SOLUTION_MIN_WIDTH,
        (node.fetch('label').length * SOLUTION_CHARACTER_WIDTH) + SOLUTION_LABEL_PADDING
      ].max
    end

    def node_height(node)
      node.fetch('kind') == 'decision' ? DECISION_SIZE : SOLUTION_HEIGHT
    end

    def chart_height(nodes)
      normalize_number(nodes.map { |node| node.fetch('y') + node.fetch('height') }.max + CHART_BOTTOM_PADDING)
    end

    def columns
      @columns ||= DEFAULT_COLUMNS.merge(source_chart.fetch('columns', {}))
    end

    def source_chart
      @source_chart ||= flowchart_data.fetch('chart')
    end

    def source_nodes
      @source_nodes ||= Helpers.ensure_array(flowchart_data.fetch('nodes'), 'Flowchart data.nodes')
    end

    def source_edges
      @source_edges ||= Helpers.ensure_array(flowchart_data.fetch('edges'), 'Flowchart data.edges')
    end

    def normalize_number(value)
      value = value.round(3)
      value.to_i == value ? value.to_i : value
    end
  end
end
