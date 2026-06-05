# frozen_string_literal: true

module SiteKit
  module Flowcharts
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
          'choicesBySource' => choices_by_source,
          'x6' => x6_payload
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
          node.fetch('aliases').each do |node_alias|
            result[node_alias] = node.fetch('id')
          end
        end
      end

      def node_meta
        @node_meta ||= node_records.to_h do |node|
          incoming_edge = incoming_edges_by_target[node.fetch('id')]
          decision = node.fetch('kind') == 'decision'

          [
            node.fetch('id'),
            node_meta_record(
              node,
              parent_id: incoming_edge&.fetch('from', '') || '',
              answer: incoming_edge&.fetch('label', '') || '',
              question: decision ? node.fetch('text') : ''
            )
          ]
        end
      end

      def choices_by_source
        @choices_by_source ||= build_choices_by_source
      end

      private

      attr_reader :flowchart

      def x6_payload
        @x6_payload ||= SiteKit::Flowcharts::X6PayloadBuilder.new(
          nodes: node_records,
          edges: edge_records
        ).build
      end

      def build_choices_by_source
        edge_records.group_by { |edge| edge.fetch('from') }.filter_map do |source_id, source_edges|
          choices = source_edges.filter_map do |edge|
            target = node_meta[edge.fetch('to')]
            next unless target

            answer = edge.fetch('label', '').empty? ? target.fetch('answer', '') : edge.fetch('label')
            target.merge('answer' => answer, 'sourceId' => source_id)
          end

          [source_id, choices] unless choices.empty?
        end.to_h
      end

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

      def node_meta_record(node, parent_id:, answer:, question:)
        {
          'id' => node.fetch('id'),
          'kind' => node.fetch('kind'),
          'text' => node.fetch('text'),
          'title' => node.fetch('text'),
          'label' => node.fetch('label'),
          'question' => question,
          'parentId' => parent_id,
          'answer' => answer
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
