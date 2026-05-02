# frozen_string_literal: true

module SiteKit
  module Templates
    module Guide
      class Repository
        def initialize(data:, templates:, code_collections:, flowchart_data:)
          @data = data
          @templates = templates
          @code_collections = code_collections
          @flowchart_data = flowchart_data
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
              template_index: template_index,
              flowchart_data: flowchart_data
            ).validate!
            record
          end
        end

        private

        attr_reader :data, :templates, :code_collections, :flowchart_data

        def build_patterns(template_index)
          SiteKit::Core::Helpers.ensure_array(data.fetch('patterns'),
                                              'Template guide patterns').map.with_index do |entry, index|
            pattern = SiteKit::Core::Helpers.ensure_hash(entry, "Template guide patterns[#{index}]")
            pattern_id = SiteKit::Core::Helpers.ensure_string(pattern['id'], 'Template guide pattern.id')
            variants = build_variants(pattern, pattern_id, template_index)
            build_pattern(pattern, pattern_id, variants)
          end.sort_by do |pattern|
            [pattern.fetch('order'), pattern.fetch('label').downcase]
          end
        end

        def build_pattern(pattern, pattern_id, variants)
          {
            'id' => pattern_id,
            'label' => SiteKit::Core::Helpers.ensure_string(pattern['label'],
                                                            "Template guide pattern #{pattern_id}.label"),
            'description' => SiteKit::Core::Helpers.ensure_string(
              pattern['description'],
              "Template guide pattern #{pattern_id}.description"
            ),
            'order' => SiteKit::Core::Helpers.ensure_integer(pattern['order'],
                                                             "Template guide pattern #{pattern_id}.order"),
            'target' => pattern_id,
            'flowchart_nodes' => SiteKit::Core::Helpers.ensure_array_of_strings(
              pattern.fetch('flowchart_nodes', []),
              "Template guide pattern #{pattern_id}.flowchart_nodes"
            ),
            'problem_rules' => SiteKit::Templates::ProblemRules.normalize(
              pattern.fetch('problem_rules', []),
              "Template guide pattern #{pattern_id}.problem_rules"
            ),
            'default_target' => default_variant_target(pattern_id, variants),
            'variants' => variants
          }
        end

        def build_variants(pattern, pattern_id, template_index)
          SiteKit::Core::Helpers.ensure_array(pattern.fetch('variants'),
                                              "Template guide pattern #{pattern_id}.variants")
                                .map.with_index do |entry, index|
            variant = SiteKit::Core::Helpers.ensure_hash(entry,
                                                         "Template guide pattern #{pattern_id}.variants[#{index}]")
            variant_id = SiteKit::Core::Helpers.ensure_string(variant['id'], "Template guide #{pattern_id}.variant.id")
            template_id = variant.fetch('template', '').to_s
            template = template_for(template_index, pattern_id, variant_id, template_id)

            variant_record(pattern_id, variant_id, variant, template, index + 1)
          end
        end

        def variant_record(pattern_id, variant_id, variant, template, order)
          template_id = template&.template_id || ''
          target = "#{pattern_id}/#{variant_id}"

          {
            'id' => variant_id,
            'label' => SiteKit::Core::Helpers.ensure_string(variant['label'], "Template guide #{target}.label"),
            'description' => variant['description'].to_s,
            'signal' => chooser_signal(variant, template),
            'order' => order,
            'pattern_id' => pattern_id,
            'target' => target,
            'template_id' => template_id,
            'has_template' => !template_id.empty?,
            'aliases' => variant_aliases(variant, template, target),
            'problem_rules' => variant_problem_rules(variant, template, target),
            'flowchart_nodes' => variant_flowchart_nodes(variant, template, target),
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

        def variant_flowchart_nodes(variant, template, target)
          configured = if variant.key?('flowchart_nodes')
                         variant.fetch('flowchart_nodes')
                       else
                         template&.flowchart_nodes || []
                       end

          SiteKit::Core::Helpers.ensure_array_of_strings(configured, "Template guide #{target}.flowchart_nodes")
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
            'code_collection' => code_collections.fetch(template.template_id)
          }
        end

        def chooser_signal(variant, template)
          configured = variant.fetch('signal', '').to_s
          return configured unless configured.empty?

          template&.description.to_s
        end

        def default_target(patterns)
          configured = data.fetch('default_target', '').to_s
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
      end
    end
  end
end
