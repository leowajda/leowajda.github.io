# frozen_string_literal: true

module SiteKit
  class EurekaContext
    def initialize(manifests:, app_config:, algorithmic_templates:, flowchart_data:, page_link_resolver:)
      @manifests = manifests
      @app_config = app_config
      @algorithmic_templates = algorithmic_templates
      @flowchart_data = flowchart_data
      @page_link_resolver = page_link_resolver
    end

    def projects
      @projects ||= manifests.to_h do |manifest|
        [
          manifest.slug,
          EurekaProject.new(
            manifest: manifest,
            app_config: app_config,
            algorithmic_templates: algorithmic_templates,
            flowchart_data: flowchart_data,
            page_link_resolver: page_link_resolver
          )
        ]
      end
    end

    def browsers
      @browsers ||= projects.transform_values(&:browser_record)
    end

    def topics
      @topics ||= projects.transform_values(&:topics_record)
    end

    def flowcharts
      @flowcharts ||= projects.transform_values do |project|
        FlowchartRegistry.new(flowchart_data: project.flowchart_data).record
      end
    end

    def generated_pages
      @generated_pages ||= projects.values.flat_map(&:generated_pages)
    end

    private

    attr_reader :manifests, :app_config, :algorithmic_templates, :flowchart_data, :page_link_resolver
  end
end
