# frozen_string_literal: true

module SiteKit
  module Flowcharts
    class LayoutConfig
      DEFAULT = {
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

      def initialize(chart:)
        raw_layout = DEFAULT.merge(chart.fetch('layout', {}))
        @record = raw_layout.merge('columns' => DEFAULT.fetch('columns').merge(raw_layout.fetch('columns', {})))
      end

      def columns
        record.fetch('columns')
      end

      def row_unit
        record.fetch('row_unit')
      end

      def bottom_padding
        record.fetch('bottom_padding')
      end

      def decision_size
        record.fetch('decision_size')
      end

      def solution_height
        record.fetch('solution_height')
      end

      def solution_min_width
        record.fetch('solution_min_width')
      end

      def solution_label_padding
        record.fetch('solution_label_padding')
      end

      def solution_character_width
        record.fetch('solution_character_width')
      end

      private

      attr_reader :record
    end
  end
end
