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
      entries = Helpers.ensure_array(raw_implementations, "Problem '#{problem_slug}'.implementations")
      implementations = entries.map.with_index do |implementation, index|
        build_implementation(
          problem_slug: problem_slug,
          problem_title: problem_title,
          problem_source_url: problem_source_url,
          raw_implementation: Helpers.ensure_hash(implementation,
                                                  "Problem '#{problem_slug}'.implementations[#{index}]"),
          index: index
        )
      end
      validate_unique_implementation_ids!(problem_slug, implementations)
      implementations
    end

    private

    attr_reader :app_config, :source_catalog, :source_root, :route_base, :languages_by_slug

    def build_implementation(problem_slug:, problem_title:, problem_source_url:, raw_implementation:, index:)
      validate_supported_keys!(problem_slug, raw_implementation, index)
      language = implementation_language(problem_slug, raw_implementation, index)
      file_path = implementation_file_path(problem_slug, raw_implementation, index)
      code = implementation_code(problem_slug, file_path, index)

      EurekaImplementation.new(
        problem_slug: problem_slug,
        problem_title: problem_title,
        problem_source_url: problem_source_url,
        language: language.slug,
        language_label: language.label,
        approach: implementation_approach(problem_slug, raw_implementation, index),
        source_url: "#{source_catalog.source_url_base}/#{file_path}",
        code: code,
        code_language: language.code_language,
        route_base: route_base
      )
    end

    def validate_supported_keys!(problem_slug, raw_implementation, index)
      unknown_keys = raw_implementation.keys - app_config.eureka.implementation_keys
      return if unknown_keys.empty?

      message = "Problem '#{problem_slug}' implementation #{index} references unsupported keys: "
      raise "#{message}#{unknown_keys.join(', ')}"
    end

    def implementation_language(problem_slug, raw_implementation, index)
      language_slug = Helpers.ensure_string(
        raw_implementation.fetch('language'),
        "Problem '#{problem_slug}'.implementations[#{index}].language"
      )
      languages_by_slug.fetch(language_slug) do
        raise "Problem '#{problem_slug}' implementation #{index} references unknown language '#{language_slug}'"
      end
    end

    def implementation_file_path(problem_slug, raw_implementation, index)
      Helpers.ensure_string(
        raw_implementation.fetch('file_path'),
        "Problem '#{problem_slug}'.implementations[#{index}].file_path"
      )
    end

    def implementation_code(problem_slug, file_path, index)
      code_path = verified_code_path(problem_slug, file_path, index)
      code = Helpers.read_text(code_path)
      raise "Eureka implementation source is empty: '#{code_path}'" if code.strip.empty?

      code
    end

    def verified_code_path(problem_slug, file_path, index)
      file_path = Helpers.ensure_string(
        file_path,
        "Problem '#{problem_slug}'.implementations[#{index}].file_path"
      )
      code_path = source_root.join(file_path).expand_path
      source_root_path = source_root.expand_path.to_s
      unless inside_source_root?(code_path, source_root_path)
        raise "Problem '#{problem_slug}' implementation #{index} file_path escapes the source root"
      end
      raise "Eureka implementation source is missing: '#{code_path}'" unless code_path.exist?

      code_path
    end

    def inside_source_root?(code_path, source_root_path)
      code_path = code_path.to_s
      code_path == source_root_path || code_path.start_with?("#{source_root_path}#{File::SEPARATOR}")
    end

    def implementation_approach(problem_slug, raw_implementation, index)
      Helpers.ensure_string(
        raw_implementation.fetch('approach'),
        "Problem '#{problem_slug}'.implementations[#{index}].approach"
      )
    end

    def validate_unique_implementation_ids!(problem_slug, implementations)
      Helpers.ensure_unique!(
        implementations.map(&:implementation_id),
        "Problem '#{problem_slug}' implementation ids must be unique"
      )
    end
  end
end
