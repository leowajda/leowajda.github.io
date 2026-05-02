# frozen_string_literal: true

module SiteKit
  module Templates
    module ProblemRules
      RULE_KEYS = %w[all any none].freeze

      module_function

      def normalize(value, context)
        SiteKit::Core::Helpers.ensure_array(value, context).map.with_index do |entry, index|
          normalize_rule(entry, "#{context}[#{index}]")
        end
      end

      def normalize_with_default(value, default_labels, context)
        return default_rule(default_labels) if value.nil?

        normalize(value, context)
      end

      def match?(rule, labels)
        all_labels = rule.fetch('all', [])
        any_labels = rule.fetch('any', [])
        none_labels = rule.fetch('none', [])

        all_labels.all? { |label| labels.include?(label) } &&
          (any_labels.empty? || any_labels.any? { |label| labels.include?(label) }) &&
          none_labels.none? { |label| labels.include?(label) }
      end

      def match_any?(rules, labels)
        rules.any? { |rule| match?(rule, labels) }
      end

      def normalize_labels(value, context)
        SiteKit::Core::Helpers.ensure_array_of_strings(value, context).uniq
      end

      def default_rule(labels)
        normalized_labels = Array(labels).uniq
        normalized_labels.empty? ? [] : [{ 'any' => normalized_labels }]
      end

      def normalize_rule(value, context)
        rule = SiteKit::Core::Helpers.ensure_hash(value, context)
        unknown_keys = rule.keys - RULE_KEYS
        if unknown_keys.any?
          raise SiteKit::CatalogError,
                "#{context} references unsupported keys: #{unknown_keys.join(', ')}"
        end

        normalized = RULE_KEYS.each_with_object({}) do |key, result|
          labels = normalize_labels(rule[key] || [], "#{context}.#{key}")
          result[key] = labels if labels.any?
        end

        unless normalized.key?('all') || normalized.key?('any')
          raise SiteKit::CatalogError,
                "#{context} must include all or any"
        end

        normalized
      end
    end
  end
end
