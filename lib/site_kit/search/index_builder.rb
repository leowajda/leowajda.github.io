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
        @records ||= [
          SiteKit::Search::PageRecordBuilder.new(factory: factory),
          SiteKit::Search::ProblemRecordBuilder.new(
            browsers: context.eureka_context.browsers,
            factory: factory
          ),
          SiteKit::Search::TemplateRecordBuilder.new(
            guide: context.template_library_context.guide,
            factory: factory
          ),
          SiteKit::Search::FlowchartRecordBuilder.new(
            flowchart: context.flowchart_data,
            summaries: eureka_data.fetch('flowchart_summaries', {}),
            factory: factory
          ),
          SiteKit::Search::SourceRecordBuilder.new(
            registries: context.source_notes_context.registries,
            factory: factory
          ),
          SiteKit::Search::WritingRecordBuilder.new(
            documents: site.collections.fetch('posts').docs,
            factory: factory
          )
        ].flat_map(&:records)
      end

      private

      attr_reader :context, :site, :factory

      def eureka_data
        @eureka_data ||= site.data.fetch(EUREKA_NAMESPACE)
      end
    end
  end
end
