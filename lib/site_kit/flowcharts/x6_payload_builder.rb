# frozen_string_literal: true

module SiteKit
  module Flowcharts
    class X6PayloadStyle
      NODE_SHAPE = 'eureka-flowchart-node'
      MOBILE_X_COMPRESSION = 0.5
      ROUTER_PADDING = 20
      MOBILE_ROUTER_PADDING = 10
      ROUTER_STEP = 20
      CONNECTOR_RADIUS = 34
      BRANCH_PORTS = {
        'yes' => { 'group' => 'outYes', 'text' => 'Yes' },
        'no' => { 'group' => 'outNo', 'text' => 'No' }
      }.freeze
      INPUT_PORT_BY_SIDE = {
        'bottom' => 'in-bottom',
        'left' => 'in-left',
        'right' => 'in-right',
        'top' => 'in-top'
      }.freeze
      INPUT_PORTS = {
        'bottom' => 'inBottom',
        'left' => 'inLeft',
        'right' => 'inRight',
        'top' => 'inTop'
      }.map { |side, group| { 'id' => INPUT_PORT_BY_SIDE.fetch(side), 'group' => group } }.freeze
      PORT_LABEL_ATTRS = {
        'fill' => 'var(--text)',
        'fontFamily' => 'monospace',
        'fontSize' => 28,
        'fontWeight' => 800,
        'paintOrder' => 'stroke fill',
        'stroke' => 'var(--surface)',
        'strokeLinejoin' => 'round',
        'strokeWidth' => 10
      }.freeze
      EDGE_ATTRS = {
        'line' => {
          'fill' => 'none',
          'stroke' => 'var(--border)',
          'strokeWidth' => 3,
          'strokeLinecap' => 'round',
          'strokeLinejoin' => 'round',
          'targetMarker' => nil
        },
        'wrap' => { 'strokeWidth' => 22 }
      }.freeze

      def self.port_groups
        @port_groups ||= {
          'inBottom' => input_port_group('bottom'),
          'inLeft' => input_port_group('left'),
          'inRight' => input_port_group('right'),
          'inTop' => input_port_group('top'),
          'outNo' => output_port_group(position: 'bottom', offset_y: -22, text_anchor: 'middle',
                                       circle_class: 'flowchart-port flowchart-port--no',
                                       fill: 'var(--surface)'),
          'outYes' => output_port_group(position: 'right', offset_x: 8, offset_y: -22, text_anchor: 'start',
                                        circle_class: 'flowchart-port flowchart-port--yes',
                                        fill: 'var(--border)')
        }
      end

      def self.input_port_group(position)
        { 'position' => position, 'attrs' => { 'circle' => { 'r' => 0, 'magnet' => false, 'opacity' => 0 } } }
      end

      def self.output_port_group(position:, offset_y:, text_anchor:, circle_class:, fill:, offset_x: nil)
        args = { 'y' => offset_y, 'attrs' => { 'text' => PORT_LABEL_ATTRS.merge('textAnchor' => text_anchor) } }
        args['x'] = offset_x if offset_x

        {
          'position' => position,
          'zIndex' => 10,
          'label' => { 'position' => { 'name' => position, 'args' => args } },
          'attrs' => {
            'circle' => {
              'r' => 8,
              'class' => circle_class,
              'fill' => fill,
              'magnet' => false,
              'stroke' => 'var(--border)',
              'strokeWidth' => 3
            }
          }
        }
      end
    end

    class X6PayloadBuilder
      def initialize(nodes:, edges:)
        @nodes = nodes
        @edges = edges
      end

      def build
        {
          'desktop' => payload(compress_x: false),
          'mobile' => payload(compress_x: true)
        }
      end

      private

      attr_reader :nodes, :edges

      def payload(compress_x:)
        rendered_nodes = nodes.map { |node| x6_node(node, compress_x:) }
        {
          'nodes' => rendered_nodes,
          'edges' => edges.map { |edge| x6_edge(edge, rendered_nodes, compress_x:) }
        }
      end

      def x6_node(node, compress_x:)
        x_position = compress_x ? (node.fetch('x') * X6PayloadStyle::MOBILE_X_COMPRESSION).round : node.fetch('x')
        rendered_node = node.merge('x' => x_position)

        {
          'id' => node.fetch('id'),
          'shape' => X6PayloadStyle::NODE_SHAPE,
          'x' => x_position,
          'y' => node.fetch('y'),
          'width' => node.fetch('width'),
          'height' => node.fetch('height'),
          'ports' => node_ports(node),
          'zIndex' => 2,
          'data' => rendered_node
        }
      end

      def x6_edge(edge, rendered_nodes, compress_x:)
        ports = edge_ports(edge, rendered_nodes)
        {
          'id' => edge.fetch('id'),
          'shape' => 'edge',
          'source' => { 'cell' => edge.fetch('from'), 'port' => ports.fetch('source_port') },
          'target' => { 'cell' => edge.fetch('to'), 'port' => ports.fetch('target_port') },
          'router' => { 'name' => 'manhattan', 'args' => router_args(compress_x:) },
          'connector' => { 'name' => 'rounded', 'args' => { 'radius' => X6PayloadStyle::CONNECTOR_RADIUS } },
          'zIndex' => 1,
          'data' => edge,
          'attrs' => X6PayloadStyle::EDGE_ATTRS
        }
      end

      def node_ports(node)
        {
          'groups' => X6PayloadStyle.port_groups,
          'items' => X6PayloadStyle::INPUT_PORTS + branch_ports_for(node)
        }
      end

      def branch_ports_for(node)
        outgoing_branches.fetch(node.fetch('id'), []).map do |branch|
          {
            'id' => "out-#{branch}",
            'group' => X6PayloadStyle::BRANCH_PORTS.fetch(branch).fetch('group'),
            'attrs' => { 'text' => { 'text' => X6PayloadStyle::BRANCH_PORTS.fetch(branch).fetch('text') } }
          }
        end
      end

      def outgoing_branches
        @outgoing_branches ||= edges.each_with_object(Hash.new { |hash, key| hash[key] = [] }) do |edge, result|
          branch = branch_name(edge.fetch('label'))
          result[edge.fetch('from')] << branch if X6PayloadStyle::BRANCH_PORTS.key?(branch)
        end
      end

      def edge_ports(edge, rendered_nodes)
        node_index = rendered_nodes.to_h { |node| [node.fetch('id'), node] }
        target_direction = target_side(node_index[edge.fetch('from')], node_index[edge.fetch('to')])
        {
          'source_port' => "out-#{branch_key(edge)}",
          'target_port' => X6PayloadStyle::INPUT_PORT_BY_SIDE.fetch(target_direction)
        }
      end

      def branch_key(edge)
        branch = branch_name(edge.fetch('label'))
        X6PayloadStyle::BRANCH_PORTS.key?(branch) ? branch : 'no'
      end

      def branch_name(label)
        label.to_s.strip.downcase
      end

      def target_side(from, to)
        return 'top' unless from && to

        source = node_center(from)
        target = node_center(to)
        delta_x = target.fetch('x') - source.fetch('x')
        delta_y = target.fetch('y') - source.fetch('y')
        return delta_x >= 0 ? 'left' : 'right' if delta_x.abs > delta_y.abs * 0.7

        delta_y >= 0 ? 'top' : 'bottom'
      end

      def node_center(node)
        {
          'x' => node.fetch('x') + (node.fetch('width') / 2.0),
          'y' => node.fetch('y') + (node.fetch('height') / 2.0)
        }
      end

      def router_args(compress_x:)
        {
          'padding' => compress_x ? X6PayloadStyle::MOBILE_ROUTER_PADDING : X6PayloadStyle::ROUTER_PADDING,
          'step' => X6PayloadStyle::ROUTER_STEP
        }
      end
    end
  end
end
