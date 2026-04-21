# frozen_string_literal: true

require "pathname"

module SiteKit
  SourceLanguageDefinition = Data.define(:slug, :title, :path, :modules)
  SourceModuleDefinition = Data.define(:slug, :title, :path, :source_roots)
  SourceNotesCatalog = Data.define(:source_url_base, :languages)

  class SourceNotesCatalogLoader
    def initialize(manifest:, app_config:)
      @manifest = manifest
      @app_config = app_config
      @repo_root = Pathname(manifest.source_root(Helpers.repo_root))
    end

    def load
      source = raw_catalog

      SourceNotesCatalog.new(
        source_url_base: Helpers.ensure_string(source.fetch("source_url_base"), "Zibaldone catalog.source_url_base"),
        languages: parse_languages(source.fetch("languages"))
      )
    end

    private

    attr_reader :manifest, :app_config, :repo_root

    def raw_catalog
      @raw_catalog ||= begin
        raw = Helpers.read_text(repo_root.join("data", "modules.yml"))
        source = Helpers.ensure_hash(Helpers.parse_yaml(raw, "Unable to decode Zibaldone modules catalog"), "Zibaldone catalog")
        version = source["version"]
        raise "Zibaldone catalog.version must be #{app_config.source_notes.catalog_version}" unless version == app_config.source_notes.catalog_version

        project = Helpers.ensure_hash(source.fetch("project"), "Zibaldone catalog.project")
        project_slug = Helpers.ensure_string(project.fetch("slug"), "Zibaldone catalog.project.slug")
        raise "Zibaldone catalog.project.slug must match '#{manifest.slug}'" unless project_slug == manifest.slug

        source
      end
    end

    def parse_languages(value)
      Helpers.ensure_hash(value, "Zibaldone catalog.languages").map do |language_slug, entry|
        raw_language = Helpers.ensure_hash(entry, "Language '#{language_slug}'")
        modules = Helpers.ensure_hash(raw_language.fetch("modules"), "Language '#{language_slug}'.modules").map do |module_slug, module_entry|
          raw_module = Helpers.ensure_hash(module_entry, "Module '#{language_slug}/#{module_slug}'")

          SourceModuleDefinition.new(
            slug: module_slug,
            title: Helpers.ensure_string(raw_module.fetch("title"), "Module '#{language_slug}/#{module_slug}'.title"),
            path: Helpers.ensure_string(raw_module.fetch("path"), "Module '#{language_slug}/#{module_slug}'.path"),
            source_roots: Helpers.ensure_array_of_strings(
              raw_module.fetch("source_roots"),
              "Module '#{language_slug}/#{module_slug}'.source_roots"
            )
          )
        end
        raise "Language '#{language_slug}' must define at least one module" if modules.empty?

        SourceLanguageDefinition.new(
          slug: language_slug,
          title: Helpers.ensure_string(raw_language.fetch("title"), "Language '#{language_slug}'.title"),
          path: Helpers.ensure_string(raw_language.fetch("path"), "Language '#{language_slug}'.path"),
          modules: modules.sort_by { |module_record| module_record.title.downcase }
        )
      end.sort_by { |language| language.title.downcase }
    end
  end
end
