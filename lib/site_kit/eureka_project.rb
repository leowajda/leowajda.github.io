# frozen_string_literal: true

module SiteKit
  class EurekaProject
    def initialize(manifest:, app_config:, algorithmic_templates:, flowchart_data:, page_link_resolver:)
      @manifest = manifest
      @app_config = app_config
      @algorithmic_templates = algorithmic_templates
      @flowchart_data = flowchart_data
      @page_link_resolver = page_link_resolver
    end

    def slug
      manifest.slug
    end

    def flowchart_data
      @flowchart_data
    end

    def browser_record
      @browser_record ||= EurekaBrowserRecordBuilder.new(
        project_slug: slug,
        project_title: manifest.title,
        project_description: manifest.description,
        route_base: manifest.route_base,
        language_page_records: catalog.language_page_records,
        problem_records: catalog.problem_records
      ).build
    end

    def topics_record
      @topics_record ||= EurekaTopicRegistry.new(
        project_slug: slug,
        templates: algorithmic_templates,
        flowchart_titles: catalog.flowchart_titles,
        problem_records: catalog.problem_records
      ).record
    end

    def generated_pages
      page_factory.language_pages + page_factory.problem_pages + page_factory.implementation_pages
    end

    def generated_language_pages
      page_factory.language_pages
    end

    def generated_problem_pages
      page_factory.problem_pages
    end

    def generated_implementation_pages
      page_factory.implementation_pages
    end

    private

    attr_reader :manifest, :app_config, :algorithmic_templates, :page_link_resolver

    def catalog
      @catalog ||= EurekaCatalogLoader.new(
        manifest: manifest,
        app_config: app_config,
        flowchart_data: flowchart_data
      ).load
    end

    def page_factory
      @page_factory ||= EurekaPageFactory.new(
        project_slug: slug,
        route_base: manifest.route_base,
        browser_record: browser_record,
        topics_record: topics_record,
        page_link_resolver: page_link_resolver
      )
    end
  end
end
