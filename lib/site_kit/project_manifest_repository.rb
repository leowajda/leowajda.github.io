# frozen_string_literal: true

module SiteKit
  ProjectManifest = Data.define(
    :slug,
    :kind,
    :title,
    :description,
    :route_base,
    :entry_url,
    :source_url,
    :source_repo_path,
    :source_optional,
    :homepage_order
  ) do
    def source_root(repo_root)
      File.join(repo_root, source_repo_path)
    end

    def source_optional?
      source_optional == true
    end
  end

  class ProjectManifestRepository
    def initialize(records)
      @records = records
    end

    def load
      manifests = Array(@records).map.with_index do |record, index|
        parse(record, "projects.yml[#{index}]")
      end
      validate_unique!(manifests, &:slug)
      validate_unique!(manifests, &:route_base)
      manifests
    end

    private

    attr_reader :records

    def parse(value, label)
      record = Helpers.ensure_hash(value, "Project manifest #{label}")
      kind = Helpers.ensure_string(record['kind'], "Project manifest #{label}.kind")
      raise "Project manifest #{label}.kind must be one of: #{valid_kinds.join(', ')}" unless valid_kinds.include?(kind)

      ProjectManifest.new(
        slug: Helpers.ensure_string(record['slug'], "Project manifest #{label}.slug"),
        kind: kind,
        title: Helpers.ensure_string(record['title'], "Project manifest #{label}.title"),
        description: Helpers.ensure_string(record['description'], "Project manifest #{label}.description"),
        route_base: Helpers.ensure_string(record['route_base'], "Project manifest #{label}.route_base"),
        entry_url: record['entry_url'].to_s,
        source_url: Helpers.ensure_string(record['source_url'], "Project manifest #{label}.source_url"),
        source_repo_path: Helpers.ensure_string(record['source_repo_path'],
                                                "Project manifest #{label}.source_repo_path"),
        source_optional: Helpers.ensure_boolean_or_nil(record['source_optional'],
                                                       "Project manifest #{label}.source_optional"),
        homepage_order: Helpers.ensure_integer_or_nil(record['homepage_order'],
                                                      "Project manifest #{label}.homepage_order") || 999
      )
    end

    def valid_kinds
      [EUREKA_PROJECT_KIND, SOURCE_NOTES_PROJECT_KIND]
    end

    def validate_unique!(manifests, &)
      Helpers.ensure_unique!(manifests.map(&), 'Project manifest values must be unique')
    end
  end
end
