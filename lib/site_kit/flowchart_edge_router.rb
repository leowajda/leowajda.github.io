# frozen_string_literal: true

module SiteKit
  class FlowchartEdgeRouter
    EDGE_OFFSET = 4
    EDGE_CONTROL_OFFSET = 65

    def initialize(from:, to:)
      @from = from
      @to = to
    end

    def attributes
      {
        'label_x' => label_x,
        'label_y' => label_y,
        'path' => path
      }
    end

    private

    attr_reader :from, :to

    def path
      return right_branch_path if right_branch?

      vertical_path
    end

    def right_branch_path
      start_x = node_right(from) + EDGE_OFFSET
      start_y = node_center_y(from)
      end_x = to.fetch('x') - EDGE_OFFSET
      end_y = node_center_y(to)
      control_offset = [((end_x - start_x).abs / 2.0), EDGE_CONTROL_OFFSET].max

      "M#{number(start_x)},#{number(start_y)} " \
        "C#{number(start_x + control_offset)},#{number(start_y)} " \
        "#{number(end_x - control_offset)},#{number(end_y)} " \
        "#{number(end_x)},#{number(end_y)}"
    end

    def vertical_path
      start_x = node_center_x(from)
      start_y = from.fetch('y') + from.fetch('height') + EDGE_OFFSET
      end_x = node_center_x(to)
      end_y = to.fetch('y') - EDGE_OFFSET
      direction = end_y >= start_y ? 1 : -1

      "M#{number(start_x)},#{number(start_y)} " \
        "C#{number(start_x)},#{number(start_y + (direction * EDGE_CONTROL_OFFSET))} " \
        "#{number(end_x)},#{number(end_y - (direction * EDGE_CONTROL_OFFSET))} " \
        "#{number(end_x)},#{number(end_y)}"
    end

    def label_x
      if right_branch?
        normalize_number((node_right(from) + to.fetch('x')) / 2.0)
      else
        normalize_number((node_center_x(from) + node_center_x(to)) / 2.0)
      end
    end

    def label_y
      normalize_number((node_center_y(from) + node_center_y(to)) / 2.0)
    end

    def node_center_x(node)
      node.fetch('x') + (node.fetch('width') / 2.0)
    end

    def node_center_y(node)
      node.fetch('y') + (node.fetch('height') / 2.0)
    end

    def node_right(node)
      node.fetch('x') + node.fetch('width')
    end

    def right_branch?
      to.fetch('x') > from.fetch('x')
    end

    def number(value)
      normalize_number(value).to_s
    end

    def normalize_number(value)
      value = value.round(3)
      value.to_i == value ? value.to_i : value
    end
  end
end
