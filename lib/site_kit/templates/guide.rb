# frozen_string_literal: true

# rubocop:disable Style/OneClassPerFile
module SiteKit
  module Templates
    module Guide
      class Repository
        def initialize(data:, templates:, code_collections:)
          @data = data
          @templates = templates
          @code_collections = code_collections
        end

        def build
          @build ||= begin
            template_index = templates.to_h { |template| [template.template_id, template] }
            patterns = build_patterns(template_index)
            record = SiteKit::Templates::Guide::IndexBuilder.new(
              patterns: patterns,
              default_target: default_target(patterns)
            ).build

            SiteKit::Templates::Guide::Validator.new(
              record: record,
              template_index: template_index
            ).validate!
            record
          end
        end

        private

        attr_reader :data, :templates, :code_collections

        def build_patterns(template_index)
          guide_schema.required_array('patterns').map.with_index do |entry, index|
            pattern_schema = schema(entry, "Template guide patterns[#{index}]")
            pattern_id = pattern_schema.required_string('id')
            variants = build_variants(pattern_schema, pattern_id, template_index)
            build_pattern(pattern_schema, pattern_id, variants)
          end.sort_by do |pattern|
            [pattern.fetch('order'), pattern.fetch('label').downcase]
          end
        end

        def build_pattern(pattern, pattern_id, variants)
          {
            'id' => pattern_id,
            'label' => pattern.required_string('label'),
            'description' => pattern.required_string('description'),
            'order' => pattern.required_integer('order'),
            'target' => pattern_id,
            'problem_rules' => SiteKit::Templates::ProblemRules.normalize(
              pattern.optional_array('problem_rules'),
              "Template guide pattern #{pattern_id}.problem_rules"
            ),
            'default_target' => default_variant_target(pattern_id, variants),
            'variants' => variants
          }
        end

        def build_variants(pattern, pattern_id, template_index)
          pattern.required_array('variants').map.with_index do |entry, index|
            variant = schema(entry, "Template guide pattern #{pattern_id}.variants[#{index}]")
            variant_id = variant.required_string('id')
            template_id = variant.optional_string('template')
            template = template_for(template_index, pattern_id, variant_id, template_id)

            variant_record(pattern_id, variant_id, variant, template, index + 1)
          end
        end

        def variant_record(pattern_id, variant_id, variant, template, order)
          template_id = template&.template_id || ''
          target = "#{pattern_id}/#{variant_id}"

          {
            'id' => variant_id,
            'label' => variant.required_string('label'),
            'description' => variant.optional_string('description'),
            'signal' => chooser_signal(variant, template),
            'order' => order,
            'pattern_id' => pattern_id,
            'target' => target,
            'template_id' => template_id,
            'has_template' => !template_id.empty?,
            'aliases' => variant_aliases(variant, template, target),
            'problem_rules' => variant_problem_rules(variant, template, target),
            'template' => template ? compact_template(template) : nil
          }.compact
        end

        def variant_aliases(variant, template, target)
          configured = variant.key?('aliases') ? variant.fetch('aliases') : template&.aliases || []

          SiteKit::Core::Helpers.ensure_array_of_strings(configured, "Template guide #{target}.aliases")
        end

        def variant_problem_rules(variant, template, target)
          return template&.problem_rules || [] unless variant.key?('problem_rules')

          SiteKit::Templates::ProblemRules.normalize(variant.fetch('problem_rules'),
                                                     "Template guide #{target}.problem_rules")
        end

        def template_for(template_index, pattern_id, variant_id, template_id)
          return nil if template_id.empty?

          template_index.fetch(template_id) do
            raise SiteKit::CatalogError,
                  "Template guide variant '#{pattern_id}/#{variant_id}' references missing template '#{template_id}'"
          end
        end

        def compact_template(template)
          {
            'id' => template.template_id,
            'topic_id' => template.topic_id,
            'title' => template.title,
            'description' => template.description,
            'entries' => code_collections.fetch(template.template_id)
          }
        end

        def chooser_signal(variant, template)
          configured = variant.optional_string('signal')
          return configured unless configured.empty?

          template&.description.to_s
        end

        def default_target(patterns)
          configured = guide_schema.optional_string('default_target')
          return configured unless configured.empty?

          default_variant = patterns.first&.fetch('variants', [])&.first
          default_variant&.fetch('target', '') || ''
        end

        def default_variant_target(pattern_id, variants)
          variant = variants.find { |entry| entry.fetch('has_template') }
          return variant.fetch('target') if variant

          raise SiteKit::CatalogError,
                "Template guide pattern '#{pattern_id}' must expose at least one concrete template"
        end

        def guide_schema
          @guide_schema ||= schema(data, 'Template guide')
        end

        def schema(record, context)
          SiteKit::Core::Schema.new(record, context)
        end
      end
    end
  end
end

module SiteKit
  module Templates
    module Guide
      class IndexBuilder
        def initialize(patterns:, default_target:)
          @patterns = patterns
          @default_target = default_target
        end

        def build
          {
            'default_target' => default_target,
            'patterns' => patterns,
            'template_panels' => template_panels,
            'redirects' => redirects,
            'reference_rules' => reference_rules,
            'templates' => templates_by_id
          }
        end

        private

        attr_reader :patterns, :default_target

        def template_panels
          patterns.flat_map do |pattern|
            pattern.fetch('variants').filter_map do |variant|
              template = variant['template']
              next unless template

              target = variant.fetch('target')
              detail_url = "#{SiteKit::TEMPLATES_URL}##{target}"
              entries = template.fetch('entries').map { |entry| entry.merge('detail_url' => detail_url) }

              template.merge(
                'pattern_id' => pattern.fetch('id'),
                'pattern_label' => pattern.fetch('label'),
                'variant_id' => variant.fetch('id'),
                'variant_label' => variant.fetch('label'),
                'signal' => variant.fetch('signal', ''),
                'target' => target,
                'detail_url' => detail_url,
                'embed_url' => entries.first.fetch('embed_url'),
                'entries' => entries
              )
            end
          end
        end

        def redirects
          patterns.each_with_object({}) do |pattern, result|
            pattern.fetch('variants').each do |variant|
              template_id = variant.fetch('template_id', '')
              next if template_id.empty?

              if result.key?(template_id)
                raise SiteKit::CatalogError,
                      "Template guide references template '#{template_id}' more than once"
              end

              result[template_id] = variant.fetch('target')
            end
          end
        end

        def reference_rules
          patterns.flat_map do |pattern|
            pattern_rules(pattern) + variant_rules(pattern)
          end
        end

        def pattern_rules(pattern)
          pattern.fetch('problem_rules', []).map do |rule|
            entrypoint_record(pattern).merge('problem_rule' => rule)
          end
        end

        def variant_rules(pattern)
          pattern.fetch('variants').flat_map do |variant|
            variant.fetch('problem_rules', []).map do |rule|
              entrypoint_record(pattern, variant).merge('problem_rule' => rule)
            end
          end
        end

        def templates_by_id
          template_panels.to_h { |template| [template.fetch('id'), template] }
        end

        def entrypoint_record(pattern, variant = nil)
          record = {
            'kind' => variant ? 'variant' : 'pattern',
            'pattern_id' => pattern.fetch('id'),
            'pattern_label' => pattern.fetch('label'),
            'label' => pattern.fetch('label'),
            'label_parts' => SiteKit::Templates::ReferenceLabel.parts(pattern:),
            'target' => pattern.fetch('target'),
            'default_target' => pattern.fetch('default_target'),
            'pattern_order' => pattern.fetch('order'),
            'variant_order' => 0
          }
          return record unless variant

          record.merge(
            'variant_id' => variant.fetch('id'),
            'variant_label' => variant.fetch('label'),
            'label' => SiteKit::Templates::ReferenceLabel.call(pattern:, variant:),
            'label_parts' => SiteKit::Templates::ReferenceLabel.parts(pattern:, variant:),
            'target' => variant.fetch('target'),
            'template_id' => variant.fetch('template_id'),
            'has_template' => variant.fetch('has_template'),
            'variant_order' => variant.fetch('order')
          )
        end
      end
    end
  end
end

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

# rubocop:enable Style/OneClassPerFile
