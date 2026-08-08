# frozen_string_literal: true

module SiteKit
  module Templates
    module Guide
      class Validator
        VISIBLE_LABEL_SEPARATOR = ' / '

        def initialize(record:, template_index:)
          @record = record
          @template_index = template_index
        end

        def validate!
          validate_visible_labels!
          validate_unique_targets!
          validate_default_target!
          validate_template_coverage!
        end

        private

        attr_reader :record, :template_index

        def validate_visible_labels!
          bad_labels = visible_labels.select { |label| label.include?(VISIBLE_LABEL_SEPARATOR) }
          return if bad_labels.empty?

          message = "Human-facing labels must not use '#{VISIBLE_LABEL_SEPARATOR}' as a separator: " \
                    "#{bad_labels.uniq.sort.join(', ')}"
          raise SiteKit::CatalogError, message
        end

        def visible_labels
          record.fetch('patterns').flat_map do |pattern|
            [
              pattern.fetch('label'),
              *pattern.fetch('variants').flat_map { |variant| [variant.fetch('label'), variant.fetch('signal', '')] }
            ]
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

        def guide_targets
          @guide_targets ||= record.fetch('patterns').flat_map do |pattern|
            [pattern.fetch('target'), *pattern.fetch('variants').map { |variant| variant.fetch('target') }]
          end
        end
      end
    end
  end
end
