# frozen_string_literal: true

module SiteKit
  module Search
    class IndexBuilder
      def initialize(context:, site:)
        @context = context
        @site = site
        @factory = SiteKit::Search::RecordFactory.new
      end

      def records
        @records ||= record_builders.flat_map(&:records)
      end

      private

      attr_reader :context, :site, :factory

      def record_builders
        [
          page_builder,
          problem_builder,
          template_builder,
          flowchart_builder,
          source_builder,
          writing_builder
        ]
      end

      def page_builder
        @page_builder ||= SiteKit::Search::PageRecordBuilder.new(
          factory:
        )
      end

      def problem_builder
        @problem_builder ||= SiteKit::Search::ProblemRecordBuilder.new(
          browsers: context.eureka_context.browsers,
          factory:
        )
      end

      def template_builder
        @template_builder ||= SiteKit::Search::TemplateRecordBuilder.new(
          guide: context.template_library_context.guide,
          factory:
        )
      end

      def flowchart_builder
        @flowchart_builder ||= SiteKit::Search::FlowchartRecordBuilder.new(
          flowchart: context.flowchart_data,
          summaries: eureka_data.fetch('flowchart_summaries', {}),
          factory:
        )
      end

      def source_builder
        @source_builder ||= SiteKit::Search::SourceRecordBuilder.new(
          registries: context.source_notes_context.registries,
          factory:
        )
      end

      def writing_builder
        @writing_builder ||= SiteKit::Search::WritingRecordBuilder.new(
          documents: site.collections.fetch('posts').docs,
          factory:
        )
      end

      def eureka_data
        @eureka_data ||= site.data.fetch(EUREKA_NAMESPACE)
      end
    end
  end
end
