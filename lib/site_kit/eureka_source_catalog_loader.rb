# frozen_string_literal: true

require 'pathname'

module SiteKit
  EurekaLanguage = Data.define(:slug, :label, :code_language) do
    def page_record(route_base)
      {
        'slug' => slug,
        'label' => label,
        'title' => "#{label} Solutions",
        'description' => "All LeetCode solutions in #{label}.",
        'url' => "#{route_base}/#{slug}/"
      }
    end
  end

  EurekaSourceCatalog = Data.define(:source_url_base, :languages, :problems, :flowchart_titles)

  class EurekaSourceCatalogLoader
    def initialize(manifest:, app_config:, flowchart_data:)
      @manifest = manifest
      @app_config = app_config
      @flowchart_data = flowchart_data
      @source_root = Pathname(manifest.source_root(Helpers.repo_root))
    end

    def load
      source = raw_catalog

      EurekaSourceCatalog.new(
        source_url_base: Helpers.ensure_string(source.fetch('source_url_base'), 'Eureka source.source_url_base'),
        languages: parse_languages(source.fetch('languages')),
        problems: Helpers.ensure_hash(source.fetch('problems'), 'Eureka source.problems'),
        flowchart_titles: build_flowchart_titles
      )
    end

    private

    attr_reader :manifest, :app_config, :flowchart_data, :source_root

    def raw_catalog
      @raw_catalog ||= begin
        raw = Helpers.read_text(source_root.join('data', 'problems.yml'))
        source = Helpers.ensure_hash(Helpers.parse_yaml(raw, 'Unable to decode Eureka problem table'), 'Eureka source')
        version = source['version']
        unless version == app_config.eureka.catalog_version
          raise "Eureka source.version must be #{app_config.eureka.catalog_version}"
        end

        source
      end
    end

    def parse_languages(value)
      Helpers.ensure_hash(value, 'Eureka source.languages').map do |language_slug, entry|
        record = Helpers.ensure_hash(entry, "Eureka source.languages.#{language_slug}")

        EurekaLanguage.new(
          slug: language_slug,
          label: Helpers.ensure_string(record.fetch('label'), "Eureka source.languages.#{language_slug}.label"),
          code_language: Helpers.ensure_string(
            record.fetch('code_language'),
            "Eureka source.languages.#{language_slug}.code_language"
          )
        )
      end
    end

    def build_flowchart_titles
      Helpers.ensure_array(flowchart_data['nodes'], 'Flowchart data.nodes').each_with_object({}) do |entry, result|
        node = Helpers.ensure_hash(entry, 'Flowchart data node')
        node_id = Helpers.ensure_string(node.fetch('id'), 'Flowchart data node.id')
        raise "Flowchart node ids must be unique: #{node_id}" if result.key?(node_id)

        result[node_id] = Helpers.ensure_string(node.fetch('title'), 'Flowchart data node.title')
      end
    end
  end
end
