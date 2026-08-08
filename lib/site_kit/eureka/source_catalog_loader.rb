# frozen_string_literal: true

require 'pathname'

module SiteKit
  module Eureka
    Language = Data.define(:slug, :label, :code_language) do
      def page_record(_route_base = nil)
        {
          'slug' => slug,
          'label' => label,
          'title' => "#{label} Solutions",
          'description' => "All LeetCode solutions in #{label}."
        }
      end
    end

    SourceCatalog = Data.define(:source_url_base, :languages, :problems)

    class SourceCatalogLoader
      def initialize(manifest:, app_config:)
        @manifest = manifest
        @app_config = app_config
        @source_root = Pathname(manifest.source_root(SiteKit::Core::Helpers.repo_root))
      end

      def load
        source = raw_catalog

        SiteKit::Eureka::SourceCatalog.new(
          source_url_base: SiteKit::Core::Helpers.ensure_string(source.fetch('source_url_base'),
                                                                'Eureka source.source_url_base'),
          languages: parse_languages(source.fetch('languages')),
          problems: SiteKit::Core::Helpers.ensure_hash(source.fetch('problems'), 'Eureka source.problems')
        )
      end

      private

      attr_reader :manifest, :app_config, :source_root

      def raw_catalog
        @raw_catalog ||= begin
          raw = SiteKit::Core::Helpers.read_text(source_root.join('data', 'problems.yml'))
          source = SiteKit::Core::Helpers.ensure_hash(
            SiteKit::Core::Helpers.parse_yaml(raw, 'Unable to decode Eureka problem table'), 'Eureka source'
          )
          version = source['version']
          expected_version = app_config.eureka.fetch('catalog_version')
          unless version == expected_version
            raise SiteKit::CatalogError, "Eureka source.version must be #{expected_version}"
          end

          source
        end
      end

      def parse_languages(value)
        SiteKit::Core::Helpers.ensure_hash(value, 'Eureka source.languages').map do |language_slug, entry|
          record = SiteKit::Core::Helpers.ensure_hash(entry, "Eureka source.languages.#{language_slug}")

          SiteKit::Eureka::Language.new(
            slug: language_slug,
            label: SiteKit::Core::Helpers.ensure_string(record.fetch('label'),
                                                        "Eureka source.languages.#{language_slug}.label"),
            code_language: SiteKit::Core::Helpers.ensure_string(
              record.fetch('code_language'),
              "Eureka source.languages.#{language_slug}.code_language"
            )
          )
        end
      end
    end
  end
end
