# frozen_string_literal: true

module SiteKit
  module Projects
    module_function

    KINDS = [EUREKA_PROJECT_KIND, SOURCE_NOTES_PROJECT_KIND].freeze

    def load(records, repo_root)
      manifests = Array(records).map.with_index { |record, index| parse(record, index) }
      SiteKit::Core::Helpers.ensure_unique!(manifests.map { |manifest| manifest.fetch('slug') },
                                            'Project slugs must be unique')
      SiteKit::Core::Helpers.ensure_unique!(manifests.map { |manifest| manifest.fetch('route_base') },
                                            'Project route bases must be unique')
      manifests.select { |manifest| available?(manifest, repo_root) }
    end

    def source_root(manifest, repo_root = SiteKit::Core::Helpers.repo_root)
      File.join(repo_root, manifest.fetch('source_repo_path'))
    end

    def parse(record, index)
      label = "projects.yml[#{index}]"
      value = SiteKit::Core::Helpers.ensure_hash(record, "Project manifest #{label}")
      kind = SiteKit::Core::Helpers.ensure_string(value['kind'], "Project manifest #{label}.kind")
      unless KINDS.include?(kind)
        raise SiteKit::CatalogError, "Project manifest #{label}.kind must be one of: #{KINDS.join(', ')}"
      end

      {
        'slug' => SiteKit::Core::Helpers.ensure_string(value['slug'], "Project manifest #{label}.slug"),
        'kind' => kind,
        'title' => SiteKit::Core::Helpers.ensure_string(value['title'], "Project manifest #{label}.title"),
        'description' => SiteKit::Core::Helpers.ensure_string(value['description'],
                                                              "Project manifest #{label}.description"),
        'route_base' => SiteKit::Core::Helpers.ensure_string(value['route_base'],
                                                             "Project manifest #{label}.route_base"),
        'entry_url' => value['entry_url'].to_s,
        'source_url' => SiteKit::Core::Helpers.ensure_string(value['source_url'],
                                                             "Project manifest #{label}.source_url"),
        'source_repo_path' => SiteKit::Core::Helpers.ensure_string(value['source_repo_path'],
                                                                   "Project manifest #{label}.source_repo_path"),
        'homepage_order' => SiteKit::Core::Helpers.ensure_integer_or_nil(
          value['homepage_order'],
          "Project manifest #{label}.homepage_order"
        ) || 999,
        'source_optional' => value['source_optional'] == true
      }
    end

    def available?(manifest, repo_root)
      root = source_root(manifest, repo_root)
      return true if File.exist?(root)
      return false if manifest['source_optional'] == true

      raise SiteKit::CatalogError, "Project '#{manifest.fetch('slug')}' source is missing at '#{root}'"
    end
  end
end
