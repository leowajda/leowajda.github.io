# frozen_string_literal: true

module SiteKit
  class EurekaImplementationLoader
    def initialize(app_config:, source_catalog:, source_root:, route_base:)
      @app_config = app_config
      @source_catalog = source_catalog
      @source_root = source_root
      @route_base = route_base
      @languages_by_slug = Helpers.index_by(source_catalog.languages, &:slug)
    end

    def load(problem_slug:, problem_title:, problem_source_url:, raw_implementations:)
      Helpers.ensure_array(raw_implementations, "Problem '#{problem_slug}'.implementations").map.with_index do |implementation, index|
        build_implementation(
          problem_slug: problem_slug,
          problem_title: problem_title,
          problem_source_url: problem_source_url,
          raw_implementation: Helpers.ensure_hash(implementation, "Problem '#{problem_slug}'.implementations[#{index}]"),
          index: index
        )
      end
    end

    private

    attr_reader :app_config, :source_catalog, :source_root, :route_base, :languages_by_slug

    def build_implementation(problem_slug:, problem_title:, problem_source_url:, raw_implementation:, index:)
      unknown_keys = raw_implementation.keys - app_config.eureka.implementation_keys
      unless unknown_keys.empty?
        raise "Problem '#{problem_slug}' implementation #{index} references unsupported keys: #{unknown_keys.join(', ')}"
      end

      language_slug = Helpers.ensure_string(
        raw_implementation.fetch("language"),
        "Problem '#{problem_slug}'.implementations[#{index}].language"
      )
      language = languages_by_slug.fetch(language_slug) do
        raise "Problem '#{problem_slug}' implementation #{index} references unknown language '#{language_slug}'"
      end
      file_path = Helpers.ensure_string(
        raw_implementation.fetch("file_path"),
        "Problem '#{problem_slug}'.implementations[#{index}].file_path"
      )
      code_path = source_root.join(file_path)
      raise "Eureka implementation source is missing: '#{code_path}'" unless code_path.exist?

      code = Helpers.read_text(code_path)
      raise "Eureka implementation source is empty: '#{code_path}'" if code.strip.empty?

      EurekaImplementation.new(
        problem_slug: problem_slug,
        problem_title: problem_title,
        problem_source_url: problem_source_url,
        language: language.slug,
        language_label: language.label,
        approach: Helpers.ensure_string(
          raw_implementation.fetch("approach"),
          "Problem '#{problem_slug}'.implementations[#{index}].approach"
        ),
        source_url: "#{source_catalog.source_url_base}/#{file_path}",
        code: code,
        code_language: language.code_language,
        route_base: route_base
      )
    end
  end
end
