# frozen_string_literal: true

module SiteKit
  module Search
    class IndexBuilder
      def initialize(site:, context:)
        @context = context
        @site = site
      end

      def records
        @records ||= [
          SiteKit::Search::PageRecordBuilder.new(
            pages: site.pages
          ),
          SiteKit::Search::ProblemRecordBuilder.new(
            browsers: context.eureka_context.browsers
          ),
          SiteKit::Search::TemplateRecordBuilder.new(
            guide: context.template_library_context.guide
          ),
          SiteKit::Search::FlowchartRecordBuilder.new(
            flowchart: context.flowchart_data,
            summaries: eureka_data.fetch('flowchart_summaries', {})
          ),
          SiteKit::Search::SourceRecordBuilder.new(
            registries: context.source_notes_context.registries
          ),
          SiteKit::Search::WritingRecordBuilder.new(
            documents: site.collections.fetch('posts').docs
          )
        ].flat_map(&:records)
      end

      private

      attr_reader :context, :site

      def eureka_data
        @eureka_data ||= site.data.fetch(EUREKA_NAMESPACE)
      end
    end
  end
end
