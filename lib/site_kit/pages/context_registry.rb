# frozen_string_literal: true

module SiteKit
  module Pages
    class ContextRegistry
      def initialize(site:, build:)
        @site = site
        @build = build
      end

      def attach_to(documents)
        documents.each do |document|
          builder = builder_for(document.data['page_context'])
          builder&.attach(document)
        end
      end

      private

      attr_reader :site, :build

      def builder_for(page_context)
        case page_context
        when 'home'
          @home_context_builder ||= SiteKit::Pages::HomeContextBuilder.new(site_projects: build.site_projects)
        when 'problem_browser'
          @problem_browser_context_builder ||= SiteKit::Pages::ProblemBrowserContextBuilder.new(
            eureka_browsers: build.eureka_context.browsers,
            page_link_resolver: build.page_link_resolver
          )
        when 'eureka_flowchart'
          flowchart_context_builder
        when 'template_library'
          @template_library_context_builder ||= SiteKit::Templates::LibraryPageContextBuilder.new(
            template_guide: build.template_library_context.guide,
            eureka_browsers: build.eureka_context.browsers,
            page_link_resolver: build.page_link_resolver
          )
        end
      end

      def flowchart_context_builder
        @flowchart_context_builder ||= SiteKit::Flowcharts::PageContextBuilder.new(
          eureka_browsers: build.eureka_context.browsers,
          eureka_topics: build.eureka_context.topics,
          flowchart_record: build.flowchart_data,
          flowchart_summaries: eureka_data.fetch('flowchart_summaries', {}),
          page_link_resolver: build.page_link_resolver
        )
      end

      def eureka_data
        @eureka_data ||= site.data.fetch(EUREKA_NAMESPACE)
      end
    end
  end
end
