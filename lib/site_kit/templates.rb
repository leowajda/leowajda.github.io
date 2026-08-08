# frozen_string_literal: true

require 'pathname'

# rubocop:disable Metrics/MethodLength

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
          (any_labels.empty? || any_labels.intersect?(labels)) &&
          !none_labels.intersect?(labels)
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

    module ReferenceLabel
      module_function

      def call(pattern:, variant: nil)
        parts(pattern:, variant:).values.reject(&:empty?).join(' ')
      end

      def parts(pattern:, variant: nil)
        pattern_label = text(pattern)
        return { 'child' => pattern_label } unless variant

        {
          'parent' => pattern_label,
          'child' => text(variant)
        }
      end

      def text(record)
        record.fetch('label').to_s.strip
      end
    end

    Topic = Data.define(
      :id,
      :label,
      :kind,
      :order,
      :priority,
      :description,
      :template_id,
      :aliases,
      :problem_rules
    ) do
      def template?
        !template_id.empty?
      end
    end

    class TopicRepository
      def initialize(topics:)
        @topics = topics
      end

      def load
        @load ||= begin
          topic_records = build_topics

          validate_unique_topic_ids!(topic_records)
          validate_unique_template_ids!(topic_records)

          topic_records.sort_by { |topic| [topic.priority, topic.order, topic.label.downcase] }
        end
      end

      private

      attr_reader :topics

      def build_topics
        SiteKit::Core::Helpers.ensure_array(topics, 'Algorithmic topics').map.with_index do |entry, index|
          topic = SiteKit::Core::Helpers.ensure_hash(entry, "Algorithmic topics[#{index}]")
          topic_id = SiteKit::Core::Helpers.ensure_string(topic['id'], 'Algorithmic topic.id')
          build_topic(topic, topic_id)
        end
      end

      def build_topic(topic, topic_id)
        aliases = SiteKit::Templates::ProblemRules.normalize_labels(topic['aliases'] || [],
                                                                    "Algorithmic topic #{topic_id}.aliases")
        template_id = topic.fetch('template', '').to_s
        order = SiteKit::Core::Helpers.ensure_integer(topic['order'], "Algorithmic topic #{topic_id}.order")
        priority = SiteKit::Core::Helpers.ensure_integer_or_nil(topic['priority'],
                                                                "Algorithmic topic #{topic_id}.priority") ||
                   order

        SiteKit::Templates::Topic.new(
          id: topic_id,
          label: SiteKit::Core::Helpers.ensure_string(topic['label'], "Algorithmic topic #{topic_id}.label"),
          kind: SiteKit::Core::Helpers.ensure_string(topic['kind'], "Algorithmic topic #{topic_id}.kind"),
          order: order,
          priority: priority,
          description: SiteKit::Core::Helpers.ensure_string(topic['description'],
                                                            "Algorithmic topic #{topic_id}.description"),
          template_id: template_id,
          aliases: aliases,
          problem_rules: SiteKit::Templates::ProblemRules.normalize_with_default(
            topic.fetch('problem_rules', nil),
            aliases,
            "Algorithmic topic #{topic_id}.problem_rules"
          )
        )
      end

      def validate_unique_topic_ids!(topic_records)
        SiteKit::Core::Helpers.ensure_unique!(topic_records.map(&:id), 'Algorithmic topic ids must be unique')
      end

      def validate_unique_template_ids!(topic_records)
        template_ids = topic_records.filter_map do |topic|
          topic.template_id unless topic.template_id.empty?
        end

        SiteKit::Core::Helpers.ensure_unique!(template_ids, 'Algorithmic topic template ids must be unique')
      end
    end

    class CodeSources
      def initialize(root:, language_catalog:)
        @root = Pathname(root)
        @language_catalog = normalize_language_catalog(language_catalog)
      end

      def entries_by_template(templates)
        template_ids = templates.map(&:template_id)
        validate_source_root!
        validate_known_template_directories!(template_ids)

        template_ids.to_h do |template_id|
          [template_id, entries_for(template_id)]
        end
      end

      private

      attr_reader :root, :language_catalog

      def normalize_language_catalog(value)
        SiteKit::Core::Helpers.ensure_hash(value, 'Template language catalog').transform_values do |entry|
          record = SiteKit::Core::Helpers.ensure_hash(entry, 'Template language catalog entry')
          code_language = SiteKit::Core::Helpers.ensure_string(
            record.fetch('code_language'),
            'Template language catalog entry.code_language'
          )
          {
            'code_language' => code_language,
            'source_extension' => SiteKit::Core::Helpers.ensure_string(
              record.fetch('source_extension', code_language),
              'Template language catalog entry.source_extension'
            )
          }
        end
      end

      def validate_source_root!
        return if root.directory?

        raise SiteKit::CatalogError, "Template code source root does not exist: #{root}"
      end

      def validate_known_template_directories!(template_ids)
        stray_directories = root.children.select(&:directory?).map { |path| path.basename.to_s } - template_ids
        return if stray_directories.empty?

        raise SiteKit::CatalogError,
              "Template code sources reference unknown templates: #{stray_directories.sort.join(', ')}"
      end

      def entries_for(template_id)
        language_catalog.map do |language, record|
          {
            'entry_id' => "#{template_id}-#{language}",
            'language' => language,
            'code' => read_code(template_id, language, record)
          }
        end
      end

      def read_code(template_id, language, record)
        relative_path = File.join(template_id, "#{language}.#{record.fetch('source_extension')}")
        path = SiteKit::Core::Helpers.confined_path(
          root,
          relative_path,
          context: "Template code source #{template_id}/#{language}",
          error_class: SiteKit::CatalogError
        )
        unless path.file?
          raise SiteKit::CatalogError, "Template '#{template_id}' is missing #{language} code source #{relative_path}"
        end

        SiteKit::Core::Helpers.read_text(path).rstrip
      end
    end

    class CodeCollections
      MAX_CODE_LINES = 180
      DISALLOWED_CODE_PATTERNS = [
        /^\s*package\s+/,
        /^\s*import\s+/,
        /^\s*#include\s+/,
        /^\s*using namespace\s+/,
        /class Solution/
      ].freeze

      def initialize(templates:, entries_by_template:, language_catalog:)
        @templates = templates
        @entries_by_template = entries_by_template
        @language_catalog = normalize_language_catalog(language_catalog)
        @paths = SiteKit::Core::ResourcePaths.new(route_base: 'templates')
      end

      def record
        @record ||= begin
          validate_known_template_entries!
          templates.to_h do |template|
            [template.template_id, entries_for(template)]
          end
        end
      end

      private

      attr_reader :templates, :entries_by_template, :language_catalog, :paths

      def validate_known_template_entries!
        known = templates.map(&:template_id)
        stray = entries_by_template.keys.map(&:to_s) - known
        return if stray.empty?

        raise SiteKit::CatalogError, "Template entries reference unknown templates: #{stray.sort.join(', ')}"
      end

      def entries_for(template)
        raw_entries = SiteKit::Core::Helpers.ensure_array(
          entries_by_template.fetch(template.template_id) do
            raise SiteKit::CatalogError, "Template '#{template.template_id}' is missing code entries"
          end,
          "Template entries for #{template.template_id}"
        )
        entries = raw_entries.map.with_index do |entry, index|
          normalize_entry(entry, "Template entries for #{template.template_id}[#{index}]", template.template_id)
        end
        validate_unique_entry_ids!(template.template_id, entries)
        validate_unique_language_variants!(template.template_id, entries)
        validate_language_coverage!(template.template_id, entries)
        entries
      end

      def normalize_language_catalog(value)
        SiteKit::Core::Helpers.ensure_hash(value, 'Template language catalog').transform_values do |entry|
          record = SiteKit::Core::Helpers.ensure_hash(entry, 'Template language catalog entry')
          {
            'label' => SiteKit::Core::Helpers.ensure_string(record.fetch('label'),
                                                            'Template language catalog entry.label'),
            'code_language' => SiteKit::Core::Helpers.ensure_string(
              record.fetch('code_language'),
              'Template language catalog entry.code_language'
            )
          }
        end
      end

      def normalize_entry(entry, context, template_id) # rubocop:disable Metrics/MethodLength
        record = SiteKit::Core::Helpers.ensure_hash(entry, context)
        entry_id = SiteKit::Core::Helpers.ensure_string(record.fetch('entry_id'), "#{context}.entry_id")
        validate_entry_id_prefix!(template_id, entry_id)
        language = SiteKit::Core::Helpers.ensure_string(record.fetch('language'), "#{context}.language")
        language_record = language_catalog.fetch(language) do
          raise SiteKit::CatalogError, "#{context}.language references unknown template language '#{language}'"
        end
        code = SiteKit::Core::Helpers.ensure_string(record.fetch('code'), "#{context}.code")
        validate_code!(code, context)

        SiteKit::Core::CodeEntry.normalize(
          {
            'entry_id' => entry_id,
            'language' => language,
            'language_label' => SiteKit::Core::Helpers.ensure_string(
              record.fetch('language_label', language_record.fetch('label')),
              "#{context}.language_label"
            ),
            'code_language' => SiteKit::Core::Helpers.ensure_string(
              record.fetch('code_language', language_record.fetch('code_language')),
              "#{context}.code_language"
            ),
            'code' => code,
            'variant' => 'default',
            'variant_label' => 'Default',
            'detail_url' => SiteKit::TEMPLATES_URL,
            'embed_url' => paths.embed(template_id)
          },
          context: context
        )
      end

      def validate_code!(code, context)
        stripped = code.strip
        raise SiteKit::CatalogError, "#{context}.code must not be empty" if stripped.empty?

        line_count = stripped.lines.size
        if line_count > MAX_CODE_LINES
          raise SiteKit::CatalogError,
                "#{context}.code must stay within #{MAX_CODE_LINES} lines, got #{line_count}"
        end

        pattern = DISALLOWED_CODE_PATTERNS.find { |candidate| code.match?(candidate) }
        return unless pattern

        raise SiteKit::CatalogError,
              "#{context}.code includes non-template boilerplate matching #{pattern.inspect}"
      end

      def validate_entry_id_prefix!(template_id, entry_id)
        return if entry_id.start_with?("#{template_id}-")

        raise SiteKit::CatalogError,
              "Template '#{template_id}' code entry id '#{entry_id}' must start with '#{template_id}-'"
      end

      def validate_unique_entry_ids!(template_id, entries)
        SiteKit::Core::Helpers.ensure_unique!(
          entries.map { |entry| entry.fetch('entry_id') },
          "Template '#{template_id}' code entry ids must be unique"
        )
      end

      def validate_unique_language_variants!(template_id, entries)
        pairs = entries.map { |entry| "#{entry.fetch('language')}/#{entry.fetch('variant')}" }
        duplicates = SiteKit::Core::Helpers.duplicates(pairs)
        return if duplicates.empty?

        raise SiteKit::CatalogError,
              "Template '#{template_id}' language and variant pairs must be unique: #{duplicates.join(', ')}"
      end

      def validate_language_coverage!(template_id, entries)
        languages = entries.map { |entry| entry.fetch('language') }
        missing = language_catalog.keys - languages
        extra = languages - language_catalog.keys
        return if missing.empty? && extra.empty?

        messages = []
        messages << "missing #{missing.join(', ')}" if missing.any?
        messages << "unknown #{extra.join(', ')}" if extra.any?
        raise SiteKit::CatalogError,
              "Template '#{template_id}' must define every supported language: #{messages.join('; ')}"
      end
    end

    module Guide
      class Repository # rubocop:disable Metrics/ClassLength
        def initialize(data:, templates:, code_collections:)
          @data = data
          @templates = templates
          @code_collections = code_collections
        end

        def build
          @build ||= begin
            template_index = templates.to_h { |template| [template.template_id, template] }
            patterns = build_patterns(template_index)
            record = assemble_guide(patterns, default_target(patterns))
            validate_guide!(record, template_index)
            record
          end
        end

        private

        attr_reader :data, :templates, :code_collections

        def assemble_guide(patterns, default_target)
          panels = template_panels(patterns)
          redirects = guide_redirects(patterns)
          {
            'default_target' => default_target,
            'patterns' => patterns,
            'template_panels' => panels,
            'redirects' => redirects,
            'reference_rules' => guide_reference_rules(patterns),
            'templates' => panels.to_h { |template| [template.fetch('id'), template] }
          }
        end

        def template_panels(patterns)
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

        def guide_redirects(patterns)
          patterns.each_with_object({}) do |pattern, result|
            pattern.fetch('variants').each do |variant|
              template_id = variant.fetch('template_id', '')
              next if template_id.empty?
              if result.key?(template_id)
                raise SiteKit::CatalogError, "Template guide references template '#{template_id}' more than once"
              end

              result[template_id] = variant.fetch('target')
            end
          end
        end

        def guide_reference_rules(patterns)
          patterns.flat_map do |pattern|
            pattern_rules = pattern.fetch('problem_rules', []).map do |rule|
              entrypoint_record(pattern).merge('problem_rule' => rule)
            end
            variant_rules = pattern.fetch('variants').flat_map do |variant|
              variant.fetch('problem_rules', []).map do |rule|
                entrypoint_record(pattern, variant).merge('problem_rule' => rule)
              end
            end
            pattern_rules + variant_rules
          end
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

        def validate_guide!(record, template_index) # rubocop:disable Metrics/AbcSize,Metrics/CyclomaticComplexity,Metrics/PerceivedComplexity
          labels = record.fetch('patterns').flat_map do |pattern|
            [pattern.fetch('label'), *pattern.fetch('variants').flat_map do |v|
              [v.fetch('label'), v.fetch('signal', '')]
            end]
          end
          bad = labels.select { |label| label.include?(' / ') }
          unless bad.empty?
            raise SiteKit::CatalogError,
                  "Human-facing labels must not use ' / ' as a separator: #{bad.uniq.sort.join(', ')}"
          end

          targets = record.fetch('patterns').flat_map do |pattern|
            [pattern.fetch('target'), *pattern.fetch('variants').map { |variant| variant.fetch('target') }]
          end
          dups = targets.tally.select { |_, count| count > 1 }.keys
          unless dups.empty?
            raise SiteKit::CatalogError, "Template guide targets must be unique: #{dups.sort.join(', ')}"
          end

          default_target = record.fetch('default_target')
          unless targets.include?(default_target)
            raise SiteKit::CatalogError, "Template guide default target '#{default_target}' is not defined"
          end

          missing = template_index.keys - record.fetch('redirects').keys
          return if missing.empty?

          raise SiteKit::CatalogError, "Template guide must reference every template: #{missing.sort.join(', ')}"
        end

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

    Template = Data.define(
      :template_id,
      :topic_id,
      :title,
      :kind,
      :order,
      :description,
      :aliases,
      :problem_rules
    )

    class LibraryContext
      def initialize(topics:, template_guide:, code_source_root:, language_catalog:)
        @topic_records = topics
        @template_guide_data = template_guide
        @code_source_root = code_source_root
        @language_catalog = language_catalog
        @paths = SiteKit::Core::ResourcePaths.new(route_base: 'templates')
      end

      def topics
        @topics ||= SiteKit::Templates::TopicRepository.new(topics: topic_records).load
      end

      def templates
        @templates ||= begin
          loaded = topics.select(&:template?).map do |topic|
            SiteKit::Templates::Template.new(
              template_id: topic.template_id,
              topic_id: topic.id,
              title: topic.label,
              kind: topic.kind,
              order: topic.order,
              description: topic.description,
              aliases: topic.aliases,
              problem_rules: topic.problem_rules
            )
          end
          SiteKit::Core::Helpers.ensure_unique!(loaded.map(&:template_id), 'Algorithmic template ids must be unique')
          loaded.sort_by { |template| [template.order, template.title.downcase] }
        end
      end

      def code_collections
        @code_collections ||= SiteKit::Templates::CodeCollections.new(
          templates: templates,
          entries_by_template: template_code_entries,
          language_catalog: language_catalog
        ).record
      end

      def guide
        @guide ||= SiteKit::Templates::Guide::Repository.new(
          data: template_guide_data,
          templates: templates,
          code_collections: code_collections
        ).build
      end

      def embed_pages
        @embed_pages ||= templates.map do |template|
          target = guide.fetch('redirects').fetch(template.template_id)
          detail_url = "#{SiteKit::TEMPLATES_URL}##{target}"
          entries = code_collections.fetch(template.template_id).map do |entry|
            entry.merge('detail_url' => detail_url)
          end
          SiteKit::Emit.page(
            dir: paths.embed(template.template_id),
            page_type: TEMPLATE_EMBED_PAGE_TYPE,
            project_slug: 'eureka',
            title: "#{template.title} · Embed",
            description: "#{template.title} template embed",
            data: {
              'entries' => entries,
              'detail_url' => detail_url,
              'embed' => true
            }
          )
        end
      end

      private

      def template_code_entries
        @template_code_entries ||= SiteKit::Templates::CodeSources.new(
          root: code_source_root,
          language_catalog: language_catalog
        ).entries_by_template(templates)
      end

      attr_reader :topic_records, :template_guide_data, :code_source_root, :language_catalog, :paths
    end
  end
end

# rubocop:enable Metrics/MethodLength
