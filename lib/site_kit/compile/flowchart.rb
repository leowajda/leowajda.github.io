# frozen_string_literal: true

module SiteKit
  module Compile
    # One-shot flowchart compile: source YAML → laid-out record + canvas payload.
    module Flowchart
      module_function

      def layout(source)
        Layout.new(source).build
      end

      def canvas(laid_out:, summaries:, flowchart_nodes:, templates_url:)
        Canvas.new(
          flowchart: laid_out,
          summaries: summaries,
          flowchart_nodes: flowchart_nodes,
          templates_url: templates_url
        ).build
      end

      # --- layout ---

      class Layout
        NODE_GEOMETRY_KEYS = %w[x y width height].freeze
        EDGE_GEOMETRY_KEYS = %w[path label_x label_y].freeze
        CLEAN_ID_PATTERN = /\A[a-z0-9]+(?:-[a-z0-9]+)*\z/
        DEFAULT_LAYOUT = {
          'row_unit' => 100,
          'bottom_padding' => 250,
          'decision_size' => 200,
          'solution_height' => 74.7969,
          'solution_min_width' => 96,
          'solution_label_padding' => 68,
          'solution_character_width' => 9,
          'columns' => {
            'main' => 100,
            'decision' => 500,
            'secondary' => 900,
            'secondary-branch' => 1250,
            'tertiary' => 1300,
            'quaternary' => 1550
          }
        }.freeze

        def initialize(flowchart_data)
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
          invalid_ids = source_nodes.filter_map do |node|
            node_id = node.fetch('id')
            node_id unless node_id.match?(CLEAN_ID_PATTERN)
          end
          unless invalid_ids.empty?
            raise SiteKit::CatalogError,
                  'Flowchart node ids must use lowercase slug segments; use aliases for legacy ids: ' \
                  "#{invalid_ids.join(', ')}"
          end

          references = source_nodes.flat_map { |node| [node.fetch('id'), *Array(node.fetch('aliases', []))] }
          duplicates = references.tally.select { |_, count| count > 1 }.keys
          unless duplicates.empty?
            raise SiteKit::CatalogError, "Flowchart node ids and aliases must be unique: #{duplicates.join(', ')}"
          end

          edge_ids = source_edges.map { |edge| edge.fetch('id') }
          edge_dupes = edge_ids.tally.select { |_, count| count > 1 }.keys
          return if edge_dupes.empty?

          raise SiteKit::CatalogError, "Flowchart edge ids must be unique: #{edge_dupes.join(', ')}"
        end

        def build_chart(nodes)
          source_chart.except('height', 'layout').merge('height' => chart_height(nodes))
        end

        def build_node(source_node)
          validate_node_source!(source_node)
          layout = source_node.fetch('layout')
          source_node.except('layout', 'short_text').merge(
            'text' => NodeText.text(source_node),
            'canvas_text' => NodeText.canvas_text(source_node),
            'search_title' => NodeText.search_title(source_node),
            'x' => layout_config.fetch('columns').fetch(layout.fetch('column')),
            'y' => normalize_number(layout.fetch('row') * layout_config.fetch('row_unit')),
            'width' => node_width(source_node),
            'height' => node_height(source_node)
          )
        end

        def build_edge(source_edge, node_index)
          generated = EDGE_GEOMETRY_KEYS & source_edge.keys
          unless generated.empty?
            raise SiteKit::CatalogError,
                  "Flowchart edge '#{source_edge.fetch('id', '(unknown)')}' defines generated geometry: " \
                  "#{generated.join(', ')}"
          end
          node_index.fetch(source_edge.fetch('from'))
          node_index.fetch(source_edge.fetch('to'))
          source_edge
        end

        def validate_node_source!(node)
          generated = NODE_GEOMETRY_KEYS & node.keys
          unless generated.empty?
            raise SiteKit::CatalogError,
                  "Flowchart node '#{node.fetch('id', '(unknown)')}' defines generated geometry: " \
                  "#{generated.join(', ')}"
          end
          NodeText.validate_source!(node)
        end

        def node_width(node)
          return layout_config.fetch('decision_size') if node.fetch('kind') == 'decision'

          [
            layout_config.fetch('solution_min_width'),
            (NodeText.canvas_text(node).length * layout_config.fetch('solution_character_width')) +
              layout_config.fetch('solution_label_padding')
          ].max
        end

        def node_height(node)
          if node.fetch('kind') == 'decision'
            layout_config.fetch('decision_size')
          else
            layout_config.fetch('solution_height')
          end
        end

        def chart_height(nodes)
          normalize_number(
            nodes.map { |node| node.fetch('y') + node.fetch('height') }.max + layout_config.fetch('bottom_padding')
          )
        end

        def layout_config
          @layout_config ||= begin
            raw = DEFAULT_LAYOUT.merge(source_chart.fetch('layout', {}))
            raw.merge('columns' => DEFAULT_LAYOUT.fetch('columns').merge(raw.fetch('columns', {})))
          end
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

      module NodeText
        GENERATED_TEXT_KEYS = %w[canvas_text].freeze
        LEGACY_TEXT_KEYS = %w[label title].freeze

        module_function

        def validate_source!(node)
          generated = GENERATED_TEXT_KEYS & node.keys
          unless generated.empty?
            raise SiteKit::CatalogError,
                  "Flowchart node '#{node.fetch('id', '(unknown)')}' defines generated text fields: " \
                  "#{generated.join(', ')}"
          end
          legacy = LEGACY_TEXT_KEYS & node.keys
          unless legacy.empty?
            raise SiteKit::CatalogError,
                  "Flowchart node '#{node.fetch('id', '(unknown)')}' uses legacy text keys: #{legacy.join(', ')}"
          end
          validate_copy!(node)
        end

        def text(node)
          node_id = node.fetch('id', '(unknown)')
          value = SiteKit::Core::Helpers.ensure_string(node.fetch('text'), "Flowchart node #{node_id}.text").strip
          raise SiteKit::CatalogError, "Flowchart node '#{node_id}' text must not be empty" if value.empty?

          value
        end

        def canvas_text(node)
          node_id = node.fetch('id', '(unknown)')
          value = SiteKit::Core::Helpers.ensure_string(node.fetch('short_text', text(node)),
                                                       "Flowchart node #{node_id}.short_text").strip
          raise SiteKit::CatalogError, "Flowchart node '#{node_id}' short_text must not be empty" if value.empty?

          value
        end

        def search_title(node)
          node_id = node.fetch('id', '(unknown)')
          value = SiteKit::Core::Helpers.ensure_string(node.fetch('search_title', text(node)),
                                                       "Flowchart node #{node_id}.search_title").strip
          raise SiteKit::CatalogError, "Flowchart node '#{node_id}' search_title must not be empty" if value.empty?

          value
        end

        def validate_copy!(node)
          node_id = node.fetch('id', '(unknown)')
          kind = SiteKit::Core::Helpers.ensure_string(node.fetch('kind'), "Flowchart node #{node_id}.kind")
          value = text(node)
          case kind
          when 'decision'
            unless value.end_with?('?')
              raise SiteKit::CatalogError, "Flowchart decision '#{node_id}' text must be phrased as a question"
            end
          when 'solution'
            if value.end_with?('?')
              raise SiteKit::CatalogError, "Flowchart solution '#{node_id}' text must not be phrased as a question"
            end
          else
            raise SiteKit::CatalogError, "Flowchart node '#{node_id}' has unknown kind '#{kind}'"
          end
        end
      end

      # --- graph index + canvas ---

      class GraphIndex
        def initialize(flowchart:)
          @flowchart = flowchart
        end

        def graph_payload
          {
            'chart' => chart_payload,
            'nodes' => node_records,
            'edges' => edge_records,
            'rootId' => root_id,
            'aliasMap' => alias_map,
            'nodeMeta' => node_meta,
            'choicesBySource' => choices_by_source
          }
        end

        def root_id
          node_records.first&.fetch('id', '') || ''
        end

        def node_records
          @node_records ||= nodes.map do |node|
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
        end

        def edge_records
          @edge_records ||= edges.map do |edge|
            {
              'id' => edge.fetch('id'),
              'from' => edge.fetch('from'),
              'to' => edge.fetch('to'),
              'label' => edge.fetch('label', '')
            }
          end
        end

        def node_by_id
          @node_by_id ||= nodes.to_h { |node| [node.fetch('id'), node] }
        end

        def incoming_edges_by_target
          @incoming_edges_by_target ||= edge_records.each_with_object({}) do |edge, result|
            target = edge.fetch('to')
            raise SiteKit::CatalogError, "Flowchart edge targets must be unique: #{target}" if result.key?(target)

            result[target] = edge
          end
        end

        def alias_map
          @alias_map ||= node_records.each_with_object({}) do |node, result|
            node.fetch('aliases', []).each { |node_alias| result[node_alias] = node.fetch('id') }
          end
        end

        def node_meta
          @node_meta ||= node_records.to_h do |node|
            node_id = node.fetch('id')
            incoming = incoming_edges_by_target[node_id]
            text = node.fetch('text', node.fetch('label', ''))
            label = node.fetch('label', text)
            decision = node.fetch('kind') == 'decision'
            [node_id, {
              'id' => node_id,
              'kind' => node.fetch('kind', ''),
              'text' => text,
              'title' => text,
              'label' => label,
              'question' => decision ? text : '',
              'parentId' => incoming&.fetch('from', '') || '',
              'answer' => incoming&.fetch('label', '') || ''
            }]
          end
        end

        def choices_by_source
          @choices_by_source ||= edge_records
                                 .group_by { |edge| edge.fetch('from', '') }
                                 .each_with_object({}) do |(source_id, source_edges), result|
            choices = source_edges.filter_map do |edge|
              target = node_meta[edge.fetch('to')]
              next unless target

              target.merge(
                'answer' => edge.fetch('label', '').empty? ? target.fetch('answer', '') : edge.fetch('label'),
                'sourceId' => source_id
              )
            end
            result[source_id] = choices unless choices.empty?
          end
        end

        private

        attr_reader :flowchart

        def chart_payload
          chart = flowchart.fetch('chart')
          {
            'title' => flowchart.fetch('title'),
            'width' => chart.fetch('width'),
            'height' => chart.fetch('height'),
            'scale_desktop' => chart.fetch('scale_desktop'),
            'scale_mobile' => chart.fetch('scale_mobile')
          }
        end

        def nodes
          @nodes ||= SiteKit::Core::Helpers.ensure_array(flowchart.fetch('nodes'), 'Flowchart data.nodes')
        end

        def edges
          @edges ||= SiteKit::Core::Helpers.ensure_array(flowchart.fetch('edges'), 'Flowchart data.edges')
        end
      end

      class Canvas
        def initialize(flowchart:, summaries:, flowchart_nodes:, templates_url:)
          @flowchart = flowchart
          @summaries = summaries
          @flowchart_nodes = flowchart_nodes
          @templates_url = templates_url
          @graph_index = GraphIndex.new(flowchart: flowchart)
        end

        def build
          validate_summaries!
          {
            'flowchart' => flowchart,
            'templates_url' => templates_url,
            'graph' => graph_index.graph_payload,
            'node_payloads' => node_payloads
          }
        end

        private

        attr_reader :flowchart, :summaries, :flowchart_nodes, :templates_url, :graph_index

        def validate_summaries!
          node_ids = flowchart.fetch('nodes').map { |node| node.fetch('id') }
          unknown = summaries.keys - node_ids
          return if unknown.empty?

          raise SiteKit::CatalogError, "Flowchart summaries reference unknown node ids: #{unknown.join(', ')}"
        end

        def node_payloads
          incoming = graph_index.incoming_edges_by_target
          flowchart.fetch('nodes').map do |node|
            node_id = node.fetch('id')
            edge = incoming[node_id]
            {
              'node' => node,
              'parent_id' => edge&.fetch('from', nil),
              'parent_answer' => edge&.fetch('label', nil),
              'summary' => summaries[node_id],
              'template_guide_entrypoints' => flowchart_nodes.fetch(node_id, [])
            }
          end
        end
      end
    end
  end
end
