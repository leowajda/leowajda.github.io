# frozen_string_literal: true

module SiteKit
  class EurekaProblemRecordBuilder
    def initialize(app_config:, route_base:)
      @app_config = app_config
      @route_base = route_base
    end

    def build(problem_slug:, raw_problem:, implementations:)
      validate_problem_keys(raw_problem, problem_slug)

      EurekaProblem.new(
        slug: problem_slug,
        title: Helpers.ensure_string(raw_problem.fetch("name"), "Problem '#{problem_slug}'.name"),
        problem_source_url: Helpers.ensure_string(raw_problem.fetch("url"), "Problem '#{problem_slug}'.url"),
        difficulty: Helpers.ensure_string(raw_problem.fetch("difficulty"), "Problem '#{problem_slug}'.difficulty"),
        categories: Helpers.ensure_array_of_strings(raw_problem.fetch("categories"), "Problem '#{problem_slug}'.categories"),
        implementations: implementations,
        route_base: route_base,
        app_config: app_config
      )
    end

    private

    attr_reader :app_config, :route_base

    def validate_problem_keys(raw_problem, problem_slug)
      unknown_keys = raw_problem.keys - (app_config.eureka.metadata_keys + ["implementations"])
      return if unknown_keys.empty?

      raise "Problem '#{problem_slug}' references unsupported keys: #{unknown_keys.join(', ')}"
    end
  end
end
