# frozen_string_literal: true

module SiteKit
  module Templates
    module Guide
      class ReferenceResolver
        PUBLIC_REFERENCE_KEYS = %w[target label label_parts kind pattern_label variant_label].freeze

        def initialize(guide:)
          @guide = guide
        end

        def references_for_categories(categories)
          matched_references = reference_rules.filter_map do |rule|
            next unless SiteKit::Templates::ProblemRules.match?(rule.fetch('problem_rule'), categories)

            matched_reference(rule)
          end

          collapse_references(matched_references).map { |reference| public_reference(reference) }
        end

        private

        attr_reader :guide

        def reference_rules
          guide.fetch('reference_rules')
        end

        def matched_reference(rule)
          problem_rule = rule.fetch('problem_rule')
          rule.except('problem_rule').merge(
            'problem_rule' => problem_rule,
            'rule_signature' => rule_signature(problem_rule),
            'specificity' => rule_specificity(problem_rule)
          )
        end

        def collapse_references(references)
          references
            .uniq { |reference| reference.fetch('target') }
            .then { |records| remove_pattern_duplicates(records) }
            .then { |records| remove_dominated_variants(records) }
            .then { |records| collapse_ambiguous_variant_groups(records) }
            .sort_by { |reference| sort_key(reference) }
        end

        def remove_pattern_duplicates(references)
          variant_pattern_ids = references
                                .select { |reference| reference.fetch('kind') == 'variant' }
                                .map { |reference| reference.fetch('pattern_id') }
          references.reject do |reference|
            reference.fetch('kind') == 'pattern' && variant_pattern_ids.include?(reference.fetch('pattern_id'))
          end
        end

        def remove_dominated_variants(references)
          references.group_by { |reference| reference.fetch('pattern_id') }.values.flat_map do |group|
            dominated_targets = dominated_variant_targets(group)
            group.reject { |reference| dominated_targets.include?(reference.fetch('target')) }
          end
        end

        def dominated_variant_targets(group)
          variants = group.select { |reference| reference.fetch('kind') == 'variant' }
          variants.filter_map do |candidate|
            candidate.fetch('target') if variants.any? { |other| variant_dominates?(other, candidate) }
          end
        end

        def variant_dominates?(other, candidate)
          return false if other.equal?(candidate)
          return false unless other.fetch('specificity') > candidate.fetch('specificity')

          candidate_labels = rule_labels(candidate)
          !candidate_labels.empty? && (candidate_labels - rule_labels(other)).empty?
        end

        def rule_labels(reference)
          rule = reference.fetch('problem_rule')
          SiteKit::Templates::ProblemRules::RULE_KEYS.flat_map { |key| rule.fetch(key, []) }.uniq
        end

        def collapse_ambiguous_variant_groups(references)
          references.group_by { |reference| reference.fetch('pattern_id') }.values.flat_map do |group|
            variants = group.select { |reference| reference.fetch('kind') == 'variant' }
            next group unless ambiguous_variant_group?(variants)

            [pattern_reference(variants.first.fetch('pattern_id'))]
          end
        end

        def ambiguous_variant_group?(variants)
          variants.size > 1 && variants.map { |reference| reference.fetch('rule_signature') }.uniq.size < variants.size
        end

        def pattern_reference(pattern_id)
          pattern = patterns_by_id.fetch(pattern_id)
          {
            'kind' => 'pattern',
            'pattern_id' => pattern.fetch('id'),
            'pattern_label' => pattern.fetch('label'),
            'label' => pattern.fetch('label'),
            'label_parts' => SiteKit::Templates::ReferenceLabel.parts(pattern:),
            'target' => pattern.fetch('target'),
            'default_target' => pattern.fetch('default_target'),
            'pattern_order' => pattern.fetch('order'),
            'variant_order' => 0,
            'specificity' => 0,
            'rule_signature' => ''
          }
        end

        def patterns_by_id
          @patterns_by_id ||= guide.fetch('patterns').to_h { |pattern| [pattern.fetch('id'), pattern] }
        end

        def rule_signature(rule)
          SiteKit::Templates::ProblemRules::RULE_KEYS.map do |key|
            "#{key}:#{rule.fetch(key, []).sort.join('|')}"
          end.join(';')
        end

        def rule_specificity(rule)
          (rule.fetch('all', []).size * 2) + rule.fetch('any', []).size + rule.fetch('none', []).size
        end

        def sort_key(reference)
          [
            reference.fetch('pattern_order'),
            -reference.fetch('specificity'),
            reference.fetch('variant_order', 0),
            reference.fetch('label').downcase
          ]
        end

        def public_reference(reference)
          PUBLIC_REFERENCE_KEYS.each_with_object({}) do |key, result|
            result[key] = reference[key] if reference.key?(key)
          end
        end
      end
    end
  end
end
