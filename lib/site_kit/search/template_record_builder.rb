# frozen_string_literal: true

module SiteKit
  module Search
    class TemplateRecordBuilder
      KIND = SiteKit::Search::Contract::KIND_TEMPLATE
      PAGE_URL = '/writing/algorithmic-templates/'

      def initialize(guide:)
        @guide = guide
      end

      def records
        guide.fetch('patterns').flat_map do |pattern|
          [pattern_record(pattern), *variant_records(pattern)]
        end
      end

      private

      attr_reader :guide

      def pattern_record(pattern)
        SiteKit::Search::Record.build(
          kind: KIND,
          title: pattern.fetch('label'),
          url: "#{PAGE_URL}##{pattern.fetch('target')}",
          project: 'Eureka',
          summary: pattern.fetch('description'),
          content: pattern_content(pattern),
          filters: { SiteKit::Search::Contract::FILTER_TEMPLATE => pattern.fetch('label') },
          meta: {
            'target' => pattern.fetch('target'),
            'pattern' => pattern.fetch('id'),
            'section' => 'Pattern'
          },
          priority: SiteKit::Search::Contract.priority(KIND)
        )
      end

      def variant_records(pattern)
        pattern.fetch('variants').select { |variant| variant.fetch('has_template') }.map do |variant|
          variant_record(pattern, variant)
        end
      end

      def variant_record(pattern, variant)
        title = SiteKit::Templates::ReferenceLabel.call(pattern:, variant:)
        SiteKit::Search::Record.build(
          kind: KIND,
          title:,
          url: "#{PAGE_URL}##{variant.fetch('target')}",
          project: 'Eureka',
          summary: variant.fetch('signal', ''),
          content: variant_content(pattern, variant, title),
          filters: { SiteKit::Search::Contract::FILTER_TEMPLATE => [pattern.fetch('label'), title] },
          meta: {
            'target' => variant.fetch('target'),
            'pattern' => pattern.fetch('id'),
            'section' => pattern.fetch('label')
          },
          priority: 95
        )
      end

      def pattern_content(pattern)
        [
          pattern.fetch('label'),
          pattern.fetch('description'),
          pattern.fetch('variants').map { |variant| variant.fetch('label') },
          pattern.fetch('variants').flat_map { |variant| variant.fetch('aliases', []) }
        ]
      end

      def variant_content(pattern, variant, title)
        [
          title,
          pattern.fetch('description'),
          variant.fetch('description', ''),
          variant.fetch('signal', ''),
          variant.fetch('aliases', []),
          variant.fetch('target'),
          variant.dig('template', 'title'),
          variant.dig('template', 'description')
        ]
      end
    end
  end
end
