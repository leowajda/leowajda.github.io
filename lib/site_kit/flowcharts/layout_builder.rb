# frozen_string_literal: true

module SiteKit
  module Flowcharts
    class LayoutBuilder
      NODE_GEOMETRY_KEYS = %w[x y width height].freeze
      EDGE_GEOMETRY_KEYS = %w[path label_x label_y].freeze
      LEGACY_ID_PATTERN = %r{/|contraints|huh|twopointers|prefixsums|binarysearch}

      def initialize(flowchart_data:)
        @flowchart_data = flowchart_data
      end

      def build
        validate_source!

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

      def validate_source!
        validate_clean_node_ids!
        validate_unique_node_references!
        validate_unique_edge_ids!
      end

      def build_chart(nodes)
        chart = source_chart.except('height', 'layout')
        chart.merge('height' => chart_height(nodes))
      end

      def build_node(source_node)
        validate_node_source!(source_node)

        layout = source_node.fetch('layout')
        node = source_node.except('layout', 'short_text')
        node.merge(
          'text' => SiteKit::Flowcharts::NodeText.text(source_node),
          'canvas_text' => SiteKit::Flowcharts::NodeText.canvas_text(source_node),
          'search_title' => SiteKit::Flowcharts::NodeText.search_title(source_node),
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

        source_edge.merge(SiteKit::Flowcharts::EdgeRouter.new(from:, to:).attributes)
      end

      def validate_node_source!(node)
        generated_keys = NODE_GEOMETRY_KEYS & node.keys
        unless generated_keys.empty?
          raise SiteKit::CatalogError,
                "Flowchart node '#{node.fetch('id',
                                              '(unknown)')}' defines generated geometry: #{generated_keys.join(', ')}"
        end

        SiteKit::Flowcharts::NodeText.validate_source!(node)
      end

      def validate_edge_source!(edge)
        generated_keys = EDGE_GEOMETRY_KEYS & edge.keys
        return if generated_keys.empty?

        raise SiteKit::CatalogError,
              "Flowchart edge '#{edge.fetch('id',
                                            '(unknown)')}' defines generated geometry: #{generated_keys.join(', ')}"
      end

      def validate_clean_node_ids!
        legacy_ids = source_nodes.filter_map do |node|
          node_id = node.fetch('id')
          node_id if node_id.match?(LEGACY_ID_PATTERN)
        end
        return if legacy_ids.empty?

        raise SiteKit::CatalogError,
              "Flowchart node ids must be clean; use aliases for legacy ids: #{legacy_ids.join(', ')}"
      end

      def validate_unique_node_references!
        references = source_nodes.flat_map do |node|
          [node.fetch('id'), *Array(node.fetch('aliases', []))]
        end
        duplicates = references.tally.select { |_reference, count| count > 1 }.keys
        return if duplicates.empty?

        raise SiteKit::CatalogError, "Flowchart node ids and aliases must be unique: #{duplicates.join(', ')}"
      end

      def validate_unique_edge_ids!
        edge_ids = source_edges.map { |edge| edge.fetch('id') }
        duplicates = edge_ids.tally.select { |_edge_id, count| count > 1 }.keys
        return if duplicates.empty?

        raise SiteKit::CatalogError, "Flowchart edge ids must be unique: #{duplicates.join(', ')}"
      end

      def column_x(layout)
        layout_config.columns.fetch(layout.fetch('column'))
      end

      def row_y(layout)
        normalize_number(layout.fetch('row') * layout_config.row_unit)
      end

      def node_width(node)
        return layout_config.decision_size if node.fetch('kind') == 'decision'

        [
          layout_config.solution_min_width,
          (SiteKit::Flowcharts::NodeText.canvas_text(node).length * layout_config.solution_character_width) +
            layout_config.solution_label_padding
        ].max
      end

      def node_height(node)
        node.fetch('kind') == 'decision' ? layout_config.decision_size : layout_config.solution_height
      end

      def chart_height(nodes)
        normalize_number(nodes.map { |node| node.fetch('y') + node.fetch('height') }.max + layout_config.bottom_padding)
      end

      def layout_config
        @layout_config ||= SiteKit::Flowcharts::LayoutConfig.new(chart: source_chart)
      end

      def source_chart
        @source_chart ||= flowchart_data.fetch('chart')
      end

      def source_nodes
        @source_nodes ||= SiteKit::Core::Helpers.ensure_array(flowchart_data.fetch('nodes'), 'Flowchart data.nodes')
      end

      def source_edges
        @source_edges ||= SiteKit::Core::Helpers.ensure_array(flowchart_data.fetch('edges'), 'Flowchart data.edges')
      end

      def normalize_number(value)
        value = value.round(3)
        value.to_i == value ? value.to_i : value
      end
    end
  end
end
