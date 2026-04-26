# frozen_string_literal: true

module SiteKit
  EurekaCatalog = Data.define(
    :language_page_records,
    :problem_records,
    :flowchart_titles
  )

  class EurekaProblemRegistryBuilder
    def initialize(manifest:, app_config:, source_catalog:, source_root:)
      @manifest = manifest
      @app_config = app_config
      @source_catalog = source_catalog
      @source_root = source_root
      @implementation_loader = EurekaImplementationLoader.new(
        app_config: app_config,
        source_catalog: source_catalog,
        source_root: source_root,
        route_base: manifest.route_base
      )
      @problem_builder = EurekaProblemRecordBuilder.new(app_config: app_config, route_base: manifest.route_base)
    end

    def build
      problem_objects = build_problem_objects
      language_page_records = source_catalog.languages.map { |language| language.page_record(manifest.route_base) }
      problem_records = problem_objects.map(&:summary_hash)

      EurekaCatalog.new(
        language_page_records: language_page_records,
        problem_records: problem_records,
        flowchart_titles: source_catalog.flowchart_titles
      )
    end

    private

    attr_reader :manifest, :app_config, :source_catalog, :source_root, :implementation_loader, :problem_builder

    def build_problem_objects
      source_catalog.problems.map do |problem_slug, entry|
        raw_problem = Helpers.ensure_hash(entry, "Problem '#{problem_slug}'")
        problem_title = Helpers.ensure_string(raw_problem.fetch('name'), "Problem '#{problem_slug}'.name")
        problem_source_url = Helpers.ensure_string(raw_problem.fetch('url'), "Problem '#{problem_slug}'.url")

        implementations = implementation_loader.load(
          problem_slug: problem_slug,
          problem_title: problem_title,
          problem_source_url: problem_source_url,
          raw_implementations: raw_problem.fetch('implementations')
        )
        raise "Problem '#{problem_slug}' has no implementations" if implementations.empty?

        problem_builder.build(
          problem_slug: problem_slug,
          raw_problem: raw_problem,
          implementations: implementations
        )
      end.sort_by { |problem| problem.title.downcase }
    end
  end
end
