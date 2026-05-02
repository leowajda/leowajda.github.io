# frozen_string_literal: true

module SiteKit
  module Templates
    module Guide
      class Validator
        VISIBLE_LABEL_SEPARATOR = ' / '

        def initialize(record:, template_index:, flowchart_data:)
          @record = record
          @template_index = template_index
          @flowchart_data = flowchart_data
        end

        def validate!
          validate_visible_labels!
          validate_unique_targets!
          validate_default_target!
          validate_template_coverage!
          validate_flowchart_references!
          validate_flowchart_entrypoints_are_atomic!
          validate_flowchart_coverage!
          validate_template_flowchart_alignment!
        end

        private

        attr_reader :record, :template_index, :flowchart_data

        def validate_visible_labels!
          bad_labels = visible_labels.select { |label| label.include?(VISIBLE_LABEL_SEPARATOR) }
          return if bad_labels.empty?

          message = "Human-facing labels must not use '#{VISIBLE_LABEL_SEPARATOR}' as a separator: " \
                    "#{bad_labels.uniq.sort.join(', ')}"
          raise SiteKit::CatalogError, message
        end

        def visible_labels
          template_guide_labels + flowchart_labels
        end

        def template_guide_labels
          record.fetch('patterns').flat_map do |pattern|
            [
              pattern.fetch('label'),
              *pattern.fetch('variants').flat_map { |variant| [variant.fetch('label'), variant.fetch('signal', '')] }
            ]
          end
        end

        def flowchart_labels
          SiteKit::Core::Helpers.ensure_array(flowchart_data.fetch('nodes'), 'Flowchart data.nodes').flat_map do |node|
            node = SiteKit::Core::Helpers.ensure_hash(node, 'Flowchart node')
            [node.fetch('text', ''), node.fetch('canvas_text', ''), node.fetch('search_title', '')]
          end
        end

        def validate_template_coverage!
          covered_template_ids = record.fetch('redirects').keys
          missing_template_ids = template_index.keys - covered_template_ids
          return if missing_template_ids.empty?

          raise SiteKit::CatalogError,
                "Template guide must reference every template: #{missing_template_ids.sort.join(', ')}"
        end

        def validate_unique_targets!
          duplicates = guide_targets.tally.select { |_target, count| count > 1 }.keys
          return if duplicates.empty?

          raise SiteKit::CatalogError, "Template guide targets must be unique: #{duplicates.sort.join(', ')}"
        end

        def validate_default_target!
          default_target = record.fetch('default_target')
          return if guide_targets.include?(default_target)

          raise SiteKit::CatalogError, "Template guide default target '#{default_target}' is not defined"
        end

        def validate_flowchart_coverage!
          missing_node_ids = solution_node_ids - record.fetch('flowchart_nodes').keys
          return if missing_node_ids.empty?

          raise SiteKit::CatalogError,
                "Template guide must cover every flowchart solution node: #{missing_node_ids.sort.join(', ')}"
        end

        def validate_flowchart_references!
          unknown_node_ids = record.fetch('flowchart_nodes').keys - solution_node_ids
          return if unknown_node_ids.empty?

          raise SiteKit::CatalogError,
                "Template guide references unknown flowchart solution nodes: #{unknown_node_ids.sort.join(', ')}"
        end

        def validate_flowchart_entrypoints_are_atomic!
          overloaded_node_ids = record.fetch('flowchart_nodes').filter_map do |node_id, entrypoints|
            node_id if entrypoints.map { |entrypoint| entrypoint.fetch('target') }.uniq.size > 1
          end
          return if overloaded_node_ids.empty?

          raise SiteKit::CatalogError,
                "Flowchart solution nodes must map to one template guide target: #{overloaded_node_ids.sort.join(', ')}"
        end

        def validate_template_flowchart_alignment!
          guide_nodes_by_template.each do |template_id, guide_node_ids|
            template = template_index.fetch(template_id)
            expected_node_ids = template.flowchart_nodes.sort
            actual_node_ids = guide_node_ids.sort
            next if actual_node_ids == expected_node_ids

            raise flowchart_alignment_error(template_id, expected_node_ids, actual_node_ids)
          end
        end

        def flowchart_alignment_error(template_id, expected_node_ids, actual_node_ids)
          "Template guide flowchart nodes for '#{template_id}' must match algorithmic topics: " \
            "expected #{expected_node_ids.join(', ')}, got #{actual_node_ids.join(', ')}"
        end

        def guide_targets
          @guide_targets ||= record.fetch('patterns').flat_map do |pattern|
            [pattern.fetch('target'), *pattern.fetch('variants').map { |variant| variant.fetch('target') }]
          end
        end

        def guide_nodes_by_template
          @guide_nodes_by_template ||= record.fetch('patterns').each_with_object({}) do |pattern, result|
            pattern_nodes = pattern.fetch('flowchart_nodes', [])
            if pattern_nodes.any?
              default_template_id = default_variant_template_id(pattern)
              if default_template_id.empty?
                raise SiteKit::CatalogError,
                      "Template guide pattern '#{pattern.fetch('id')}' maps flowchart nodes but has no default template"
              end

              result[default_template_id] ||= []
              result[default_template_id] |= pattern_nodes
            end

            pattern.fetch('variants').each do |variant|
              template_id = variant.fetch('template_id', '')
              next if template_id.empty?

              result[template_id] ||= []
              result[template_id] |= variant.fetch('flowchart_nodes', [])
            end
          end
        end

        def default_variant_template_id(pattern)
          pattern.fetch('variants')
                 .find { |variant| variant.fetch('target') == pattern.fetch('default_target') }
                 &.fetch('template_id', '') || ''
        end

        def solution_node_ids
          SiteKit::Core::Helpers.ensure_array(flowchart_data.fetch('nodes'),
                                              'Flowchart data.nodes').filter_map do |node|
            node = SiteKit::Core::Helpers.ensure_hash(node, 'Flowchart node')
            node.fetch('id') if node['kind'] == 'solution'
          end
        end
      end
    end
  end
end
