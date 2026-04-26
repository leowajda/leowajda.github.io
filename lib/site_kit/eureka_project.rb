# frozen_string_literal: true

module SiteKit
  class EurekaProject
    def initialize(manifest:, app_config:, algorithmic_topics:, algorithmic_templates:, template_guide:,
                   flowchart_data:, page_link_resolver:)
      @manifest = manifest
      @app_config = app_config
      @algorithmic_topics = algorithmic_topics
      @algorithmic_templates = algorithmic_templates
      @template_guide = template_guide
      @flowchart_data = flowchart_data
      @page_link_resolver = page_link_resolver
    end

    def slug
      manifest.slug
    end

    attr_reader :flowchart_data

    def browser_record
      @browser_record ||= EurekaBrowserRecordBuilder.new(
        project_slug: slug,
        project_title: manifest.title,
        project_description: manifest.description,
        route_base: manifest.route_base,
        language_page_records: catalog.language_page_records,
        problem_records: problem_records
      ).build
    end

    def topics_record
      @topics_record ||= EurekaTopicRegistry.new(
        project_slug: slug,
        topics: algorithmic_topics,
        templates: algorithmic_templates,
        template_guide: template_guide,
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

    attr_reader :manifest, :app_config, :algorithmic_topics, :algorithmic_templates, :template_guide,
                :page_link_resolver

    def problem_records
      @problem_records ||= catalog.problem_records.map do |problem|
        problem_topics = topics_record.fetch('problems').fetch(problem.fetch('problem_slug'))
        template_references = with_template_reference_urls(problem_topics.fetch('template_references', []))
        record = problem.merge('template_references' => template_references)

        with_code_collection(record)
      end
    end

    def with_code_collection(problem)
      problem.merge(
        'implementations_by_language' => problem.fetch('implementations').group_by { |entry| entry.fetch('language') },
        'code_collection' => problem_code_collection(problem)
      )
    end

    def problem_code_collection(problem)
      implementations = problem.fetch('implementations')

      CodeCollectionModel.build(
        entries: implementations,
        default_entry_id: implementations.first&.fetch('entry_id'),
        toolbar_aria: app_config.eureka.browser.toolbar_label,
        variant_catalog: app_config.code_collection.implementation_modes,
        variant_group_label: app_config.eureka.browser.variant_group_label,
        variant_group_visibility: app_config.eureka.browser.variant_group_visibility,
        variant_presentation: app_config.eureka.browser.variant_presentation,
        variant_icon_map: app_config.code_collection.variant_icons,
        sync_hash: true,
        problem_source_url: problem.fetch('problem_source_url')
      )
    end

    def with_template_reference_urls(template_references)
      template_references.map do |reference|
        reference.merge('url' => template_guide_url_resolver.url_for(reference))
      end
    end

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

    def template_guide_url_resolver
      @template_guide_url_resolver ||= TemplateGuideUrlResolver.new(page_link_resolver: page_link_resolver)
    end
  end
end
