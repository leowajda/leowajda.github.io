# frozen_string_literal: true

module SiteKit
  module Eureka
    class Project
      def initialize(manifest:, app_config:, template_library:, flowchart_data:)
        @manifest = manifest
        @app_config = app_config
        @template_library = template_library
        @flowchart_data = flowchart_data
      end

      def slug
        manifest.slug
      end

      attr_reader :flowchart_data

      def browser_record
        @browser_record ||= begin
          languages = catalog.language_page_records.map { |language| language.slice('slug', 'label') }
          {
            'project_slug' => slug,
            'project_title' => manifest.title,
            'project_description' => manifest.description,
            'browser_url' => SiteKit::Core::ResourcePaths.new(route_base: manifest.route_base).catalog('problems'),
            'filters' => {
              'difficulties' => problem_records.map { |problem| problem.fetch('difficulty') }.uniq,
              'categories' => problem_records.flat_map { |problem| problem.fetch('categories') }.uniq,
              'languages' => languages
            },
            'languages' => languages,
            'problems' => problem_records
          }
        end
      end

      def topics_record
        @topics_record ||= SiteKit::Eureka::Topics.record(
          project_slug: slug,
          topics: template_library.topics,
          templates: template_library.templates,
          template_guide: template_library.guide,
          flowchart_titles: catalog.flowchart_titles,
          problem_records: catalog.problem_records
        )
      end

      def generated_pages
        page_factory.problem_pages + page_factory.embed_pages
      end

      def generated_problem_pages
        page_factory.problem_pages
      end

      def generated_embed_pages
        page_factory.embed_pages
      end

      private

      attr_reader :manifest, :app_config, :template_library

      def problem_records
        @problem_records ||= catalog.problem_records.map do |problem|
          refs = topics_record.fetch('problems').fetch(problem.fetch('problem_slug')).fetch('template_references', [])
          problem.merge(
            'template_references' => refs.map do |reference|
              target = reference.fetch('target', '')
              reference.merge('url' => target.empty? ? '' : "#{SiteKit::TEMPLATES_URL}##{target}")
            end
          )
        end
      end

      def catalog
        @catalog ||= SiteKit::Eureka::CatalogLoader.new(
          manifest: manifest,
          app_config: app_config,
          flowchart_data: flowchart_data
        ).load
      end

      def page_factory
        @page_factory ||= SiteKit::Eureka::PageFactory.new(
          project_slug: slug,
          route_base: manifest.route_base,
          browser_record: browser_record
        )
      end
    end
  end
end
