# frozen_string_literal: true

module SiteKit
  class TemplateGuideRepository
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
        record = TemplateGuideIndexBuilder.new(
          patterns: patterns,
          default_target: default_target(patterns)
        ).build

        TemplateGuideValidator.new(
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
      Helpers.ensure_array(data.fetch('patterns'), 'Template guide patterns').map.with_index do |entry, index|
        pattern = Helpers.ensure_hash(entry, "Template guide patterns[#{index}]")
        pattern_id = Helpers.ensure_string(pattern['id'], 'Template guide pattern.id')
        variants = build_variants(pattern, pattern_id, template_index)

        {
          'id' => pattern_id,
          'label' => Helpers.ensure_string(pattern['label'], "Template guide pattern #{pattern_id}.label"),
          'description' => Helpers.ensure_string(
            pattern['description'],
            "Template guide pattern #{pattern_id}.description"
          ),
          'order' => Helpers.ensure_integer(pattern['order'], "Template guide pattern #{pattern_id}.order"),
          'target' => pattern_id,
          'flowchart_nodes' => Helpers.ensure_array_of_strings(
            pattern.fetch('flowchart_nodes', []),
            "Template guide pattern #{pattern_id}.flowchart_nodes"
          ),
          'problem_rules' => ProblemRules.normalize(
            pattern.fetch('problem_rules', []),
            "Template guide pattern #{pattern_id}.problem_rules"
          ),
          'default_target' => default_variant_target(pattern_id, variants),
          'variants' => variants
        }
      end.sort_by { |pattern| [pattern.fetch('order'), pattern.fetch('label').downcase] }
    end

    def build_variants(pattern, pattern_id, template_index)
      Helpers.ensure_array(pattern.fetch('variants'), "Template guide pattern #{pattern_id}.variants")
             .map.with_index do |entry, index|
        variant = Helpers.ensure_hash(entry, "Template guide pattern #{pattern_id}.variants[#{index}]")
        variant_id = Helpers.ensure_string(variant['id'], "Template guide #{pattern_id}.variant.id")
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
        'label' => Helpers.ensure_string(variant['label'], "Template guide #{target}.label"),
        'description' => variant['description'].to_s,
        'signal' => chooser_signal(variant, template),
        'order' => order,
        'pattern_id' => pattern_id,
        'target' => target,
        'template_id' => template_id,
        'has_template' => !template_id.empty?,
        'aliases' => Helpers.ensure_array_of_strings(variant.fetch('aliases', []),
                                                     "Template guide #{target}.aliases"),
        'problem_rules' => ProblemRules.normalize(
          variant.fetch('problem_rules', []),
          "Template guide #{target}.problem_rules"
        ),
        'flowchart_nodes' => Helpers.ensure_array_of_strings(variant.fetch('flowchart_nodes', []),
                                                             "Template guide #{target}.flowchart_nodes"),
        'template' => template ? compact_template(template) : nil
      }.compact
    end

    def template_for(template_index, pattern_id, variant_id, template_id)
      return nil if template_id.empty?

      template_index.fetch(template_id) do
        raise "Template guide variant '#{pattern_id}/#{variant_id}' references missing template '#{template_id}'"
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

      raise "Template guide pattern '#{pattern_id}' must expose at least one concrete template"
    end
  end
end
