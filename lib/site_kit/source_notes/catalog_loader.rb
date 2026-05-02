# frozen_string_literal: true

require 'pathname'

module SiteKit
  module SourceNotes
    LanguageDefinition = Data.define(:slug, :title, :path, :modules)
    ModuleDefinition = Data.define(:slug, :title, :path, :source_roots)
    Catalog = Data.define(:source_url_base, :languages)

    class CatalogLoader
      def initialize(manifest:, app_config:)
        @manifest = manifest
        @app_config = app_config
        @repo_root = Pathname(manifest.source_root(SiteKit::Core::Helpers.repo_root))
      end

      def load
        source = raw_catalog

        SiteKit::SourceNotes::Catalog.new(
          source_url_base: SiteKit::Core::Helpers.ensure_string(source.fetch('source_url_base'),
                                                                'Zibaldone catalog.source_url_base'),
          languages: parse_languages(source.fetch('languages'))
        )
      end

      private

      attr_reader :manifest, :app_config, :repo_root

      def raw_catalog
        @raw_catalog ||= begin
          raw = SiteKit::Core::Helpers.read_text(repo_root.join('data', 'modules.yml'))
          source = SiteKit::Core::Helpers.ensure_hash(
            SiteKit::Core::Helpers.parse_yaml(raw, 'Unable to decode Zibaldone modules catalog'),
            'Zibaldone catalog'
          )
          version = source['version']
          unless version == app_config.source_notes.catalog_version
            raise SiteKit::CatalogError, "Zibaldone catalog.version must be #{app_config.source_notes.catalog_version}"
          end

          project = SiteKit::Core::Helpers.ensure_hash(source.fetch('project'), 'Zibaldone catalog.project')
          project_slug = SiteKit::Core::Helpers.ensure_string(project.fetch('slug'), 'Zibaldone catalog.project.slug')
          unless project_slug == manifest.slug
            raise SiteKit::CatalogError,
                  "Zibaldone catalog.project.slug must match '#{manifest.slug}'"
          end

          source
        end
      end

      def parse_languages(value)
        SiteKit::Core::Helpers.ensure_hash(value, 'Zibaldone catalog.languages').map do |language_slug, entry|
          raw_language = SiteKit::Core::Helpers.ensure_hash(entry, "Language '#{language_slug}'")
          modules = SiteKit::Core::Helpers.ensure_hash(
            raw_language.fetch('modules'),
            "Language '#{language_slug}'.modules"
          ).map do |module_slug, module_entry|
            raw_module = SiteKit::Core::Helpers.ensure_hash(module_entry, "Module '#{language_slug}/#{module_slug}'")

            SiteKit::SourceNotes::ModuleDefinition.new(
              slug: module_slug,
              title: SiteKit::Core::Helpers.ensure_string(raw_module.fetch('title'),
                                                          "Module '#{language_slug}/#{module_slug}'.title"),
              path: SiteKit::Core::Helpers.ensure_string(raw_module.fetch('path'),
                                                         "Module '#{language_slug}/#{module_slug}'.path"),
              source_roots: SiteKit::Core::Helpers.ensure_array_of_strings(
                raw_module.fetch('source_roots'),
                "Module '#{language_slug}/#{module_slug}'.source_roots"
              )
            )
          end
          raise SiteKit::CatalogError, "Language '#{language_slug}' must define at least one module" if modules.empty?

          SiteKit::SourceNotes::LanguageDefinition.new(
            slug: language_slug,
            title: SiteKit::Core::Helpers.ensure_string(raw_language.fetch('title'),
                                                        "Language '#{language_slug}'.title"),
            path: SiteKit::Core::Helpers.ensure_string(raw_language.fetch('path'), "Language '#{language_slug}'.path"),
            modules: modules.sort_by { |module_record| module_record.title.downcase }
          )
        end.sort_by { |language| language.title.downcase }
      end
    end
  end
end
