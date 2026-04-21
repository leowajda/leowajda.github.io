# frozen_string_literal: true

require_relative "../../lib/site_kit"

module SiteKit
  class SiteDataGenerator < Jekyll::Generator
    safe true
    priority :highest

    def generate(site)
      documents_by_layout = authored_documents(site).group_by { |document| document.data["layout"] }
      page_context_builders(site, BuildContext.for(site)).each do |layout, builder|
        Array(documents_by_layout[layout]).each do |document|
          builder.attach(document)
        end
      end
    end

    private

    def page_context_builders(site, context)
      page_link_resolver = context.page_link_resolver
      eureka_data = site.data.fetch(EUREKA_NAMESPACE)

      {
        "home" => HomePageContextBuilder.new(site_projects: context.site_projects),
        "problems" => ProblemBrowserPageContextBuilder.new(
          eureka_browsers: context.eureka_context.browsers,
          page_link_resolver: page_link_resolver
        ),
        "eureka_flowchart" => FlowchartPageContextBuilder.new(
          eureka_browsers: context.eureka_context.browsers,
          eureka_topics: context.eureka_context.topics,
          flowcharts: context.eureka_context.flowcharts,
          flowchart_record: eureka_data.fetch("flowchart"),
          flowchart_summaries: eureka_data.fetch("flowchart_summaries", {}),
          page_link_resolver: page_link_resolver
        ),
        "template_library" => TemplateLibraryPageContextBuilder.new(
          template_groups: context.template_library_context.groups,
          eureka_browsers: context.eureka_context.browsers,
          page_link_resolver: page_link_resolver
        )
      }
    end

    def authored_documents(site)
      site.pages + site.collections.fetch("posts").docs
    end
  end
end
