# frozen_string_literal: true

module SiteKit
  class TemplateGuideIndexBuilder
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
        'flowchart_nodes' => flowchart_nodes,
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

          template.merge(
            'pattern_id' => pattern.fetch('id'),
            'pattern_label' => pattern.fetch('label'),
            'variant_id' => variant.fetch('id'),
            'variant_label' => variant.fetch('label'),
            'signal' => variant.fetch('signal', ''),
            'target' => variant.fetch('target')
          )
        end
      end
    end

    def redirects
      patterns.each_with_object({}) do |pattern, result|
        pattern.fetch('variants').each do |variant|
          template_id = variant.fetch('template_id', '')
          next if template_id.empty?

          raise "Template guide references template '#{template_id}' more than once" if result.key?(template_id)

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

    def flowchart_nodes
      entries = Hash.new { |hash, key| hash[key] = [] }
      patterns.each do |pattern|
        pattern.fetch('flowchart_nodes', []).each do |node_id|
          entries[node_id] << entrypoint_record(pattern)
        end

        pattern.fetch('variants').each do |variant|
          variant.fetch('flowchart_nodes').each do |node_id|
            entries[node_id] << entrypoint_record(pattern, variant)
          end
        end
      end
      entries.transform_values { |records| collapse_entrypoints(records) }
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
        'label_parts' => TemplateReferenceLabel.parts(pattern:),
        'target' => pattern.fetch('target'),
        'default_target' => pattern.fetch('default_target'),
        'pattern_order' => pattern.fetch('order'),
        'variant_order' => 0
      }
      return record unless variant

      record.merge(
        'variant_id' => variant.fetch('id'),
        'variant_label' => variant.fetch('label'),
        'label' => TemplateReferenceLabel.call(pattern:, variant:),
        'label_parts' => TemplateReferenceLabel.parts(pattern:, variant:),
        'target' => variant.fetch('target'),
        'template_id' => variant.fetch('template_id'),
        'has_template' => variant.fetch('has_template'),
        'variant_order' => variant.fetch('order')
      )
    end

    def collapse_entrypoints(records)
      records.uniq { |record| record.fetch('target') }
             .sort_by { |record| [record.fetch('pattern_label'), record.fetch('variant_label', '')] }
    end
  end
end
