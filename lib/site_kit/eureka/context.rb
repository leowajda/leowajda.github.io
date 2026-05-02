# frozen_string_literal: true

module SiteKit
  module Eureka
    class Context
      def initialize(manifests:, app_config:, template_library:, flowchart_data:, page_link_resolver:)
        @manifests = manifests
        @app_config = app_config
        @template_library = template_library
        @flowchart_data = flowchart_data
        @page_link_resolver = page_link_resolver
      end

      def projects
        @projects ||= manifests.to_h do |manifest|
          [
            manifest.slug,
            SiteKit::Eureka::Project.new(
              manifest: manifest,
              app_config: app_config,
              template_library: template_library,
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
          SiteKit::Flowcharts::Registry.new(flowchart_data: project.flowchart_data).record
        end
      end

      def generated_pages
        @generated_pages ||= projects.values.flat_map(&:generated_pages)
      end

      private

      attr_reader :manifests, :app_config, :template_library, :flowchart_data, :page_link_resolver
    end
  end
end
