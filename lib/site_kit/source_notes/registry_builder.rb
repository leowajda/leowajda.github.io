# frozen_string_literal: true

require 'pathname'

module SiteKit
  module SourceNotes
    class RegistryBuilder
      def initialize(manifest:, app_config:)
        @manifest = manifest
        @app_config = app_config
        @repo_root = Pathname(manifest.source_root(SiteKit::Core::Helpers.repo_root))
      end

      def record
        languages = language_records

        {
          'project_slug' => manifest.slug,
          'project_title' => manifest.title,
          'project_description' => manifest.description,
          'project_url' => project_home_url,
          'project_home_url' => project_home_url,
          'project_source_url' => manifest.source_url,
          'modules' => languages.flat_map do |language|
            language.fetch('modules').map do |module_record|
              homepage_module_record(language, module_record)
            end
          end,
          'languages' => languages
        }
      end

      private

      attr_reader :manifest, :app_config, :repo_root

      def source_catalog
        @source_catalog ||= SiteKit::SourceNotes::CatalogLoader.new(manifest: manifest, app_config: app_config).load
      end

      def language_records
        @language_records ||= source_catalog.languages.map do |language|
          language_url = SiteKit::Core::ResourcePaths.new(route_base: manifest.route_base).path(language.slug)
          language_context = {
            'project_slug' => manifest.slug,
            'project_title' => manifest.title,
            'project_url' => project_home_url,
            'project_source_url' => manifest.source_url,
            'language_slug' => language.slug,
            'language_title' => language.title,
            'language_url' => language_url
          }

          {
            'project_slug' => manifest.slug,
            'project_title' => manifest.title,
            'project_url' => project_home_url,
            'project_source_url' => manifest.source_url,
            'language_slug' => language.slug,
            'language_title' => language.title,
            'url' => language_url,
            'source_url' => module_builder.tree_source_url(language.path),
            'modules' => language.modules.map do |module_definition|
              module_builder.build(module_definition: module_definition, language_context: language_context)
            end
          }
        end
      end

      def homepage_module_record(language, module_record)
        {
          'language_slug' => language.fetch('language_slug'),
          'language_title' => language.fetch('language_title'),
          'module_slug' => module_record.fetch('module_slug'),
          'title' => module_record.fetch('title'),
          'url' => module_record.fetch('url')
        }
      end

      def project_home_url
        return manifest.entry_url unless manifest.entry_url.empty?

        SiteKit::Core::ResourcePaths.new(route_base: manifest.route_base).root
      end

      def module_builder
        @module_builder ||= SiteKit::SourceNotes::ModuleBuilder.new(
          app_config: app_config,
          manifest: manifest,
          source_url_base: source_catalog.source_url_base,
          repo_root: repo_root
        )
      end
    end
  end
end
