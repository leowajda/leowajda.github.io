# frozen_string_literal: true

module SiteKit
  module Search
    # Only hash-target extras (templates, flowchart). Problems/source/pages come from HTML crawl.
    class IndexBuilder
      def initialize(site:, context:)
        @context = context
        @site = site
      end

      def records
        @records ||= [
          SiteKit::Search::TemplateRecordBuilder.new(
            guide: context.template_library_context.guide
          ),
          SiteKit::Search::FlowchartRecordBuilder.new(
            flowchart: context.flowchart_data,
            summaries: eureka_data.fetch('flowchart_summaries', {}),
            factory: factory
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
