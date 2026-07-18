# frozen_string_literal: true

require_relative '../../lib/site_kit'

module SiteKit
  class SiteDataGenerator < Jekyll::Generator
    safe true
    priority :highest

    def generate(site)
      SiteKit::Pages::ContextRegistry.new(
        site: site,
        build: SiteKit::Build::Context.for(site)
      ).attach_to(authored_documents(site))
    end

    private

    def page_context_builders(site, context)
      page_link_resolver = context.page_link_resolver

      {
        'home' => SiteKit::Pages::HomeContextBuilder.new(site_projects: context.site_projects),
        'problems' => SiteKit::Pages::ProblemBrowserContextBuilder.new(
          eureka_browsers: context.eureka_context.browsers,
          page_link_resolver: page_link_resolver
        ),
        'eureka_flowchart' => SiteKit::Flowcharts::PageContextBuilder.new(
          eureka_browsers: context.eureka_context.browsers,
          eureka_topics: context.eureka_context.topics,
          flowchart_record: context.flowchart_data,
          flowchart_summaries: site.data.fetch('eureka').fetch('flowchart_summaries', {}),
          page_link_resolver: context.page_link_resolver
        ),

        'template_library' => SiteKit::Templates::LibraryPageContextBuilder.new(
          template_guide: context.template_library_context.guide,
          eureka_browsers: context.eureka_context.browsers,
          page_link_resolver: page_link_resolver
        )
      }
    end

    def authored_documents(site)
      site.pages + site.collections.fetch('posts').docs
    end
  end
end
