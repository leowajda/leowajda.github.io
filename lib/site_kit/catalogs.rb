# frozen_string_literal: true

# rubocop:disable Style/OneClassPerFile

module SiteKit
  module Catalogs
    AppConfig = Data.define(:eureka, :source_notes, :code_collection)

    class AppConfigRepository
      TEXT_FILE_FORMATS = %w[code markdown].freeze

      def initialize(data_record)
        @schema = SiteKit::Core::Schema.new(data_record, 'site data.site.app')
      end

      def load
        eureka = section('eureka')
        source_notes = section('source_notes')
        code_collection = section('code_collection')
        validate_eureka!(eureka)
        validate_source_notes!(source_notes)
        validate_code_collection!(code_collection)

        SiteKit::Catalogs::AppConfig.new(
          eureka: eureka,
          source_notes: source_notes,
          code_collection: code_collection
        )
      end

      private

      attr_reader :schema

      def validate_eureka!(record)
        eureka = SiteKit::Core::Schema.new(record, 'site data.site.app.eureka')
        browser = SiteKit::Core::Schema.new(eureka.required_hash('browser'), 'site data.site.app.eureka.browser')

        eureka.required_integer('catalog_version')
        eureka.required_array_of_strings('metadata_keys')
        eureka.required_array_of_strings('implementation_keys')
        browser.required_string('toolbar_label')
        browser.required_string('variant_group_label')
        browser.required_string('variant_group_visibility')
        browser.required_string('variant_presentation')
      end

      def validate_source_notes!(record)
        source_notes = SiteKit::Core::Schema.new(record, 'site data.site.app.source_notes')

        source_notes.required_integer('catalog_version')
        source_notes.required_array_of_strings('ignored_directories')
        validate_text_file_metadata!(source_notes.required_hash('text_file_metadata'))
      end

      def validate_code_collection!(record)
        code_collection = SiteKit::Core::Schema.new(record, 'site data.site.app.code_collection')

        code_collection.required_string('default_variant_label')
        code_collection.required_string('default_toolbar_label')
        code_collection.required_hash('variant_icons')
        code_collection.required_array('variants')
      end

      def section(key)
        schema.required_hash(key)
      end

      def validate_text_file_metadata!(metadata)
        metadata.each do |extension, record|
          entry = SiteKit::Core::Schema.new(record, "site data.site.app.source_notes.text_file_metadata.#{extension}")

          unless extension.start_with?('.')
            raise SiteKit::ConfigurationError,
                  "source_notes.text_file_metadata key '#{extension}' must start with ."
          end

          format = entry.required_string('format')
          unless TEXT_FILE_FORMATS.include?(format)
            raise SiteKit::ConfigurationError,
                  "source_notes.text_file_metadata.#{extension}.format must be code or markdown"
          end

          syntax = entry.required_string('syntax')
          if format == 'code' && syntax.empty?
            raise SiteKit::ConfigurationError,
                  "source_notes.text_file_metadata.#{extension}.syntax must not be empty for code files"
          end
        end
      end
    end
  end
end

module SiteKit
  module Catalogs
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
        record = SiteKit::Core::Helpers.ensure_hash(value, "Project manifest #{label}")
        kind = SiteKit::Core::Helpers.ensure_string(record['kind'], "Project manifest #{label}.kind")
        unless valid_kinds.include?(kind)
          raise SiteKit::CatalogError,
                "Project manifest #{label}.kind must be one of: #{valid_kinds.join(', ')}"
        end

        SiteKit::Catalogs::ProjectManifest.new(
          slug: SiteKit::Core::Helpers.ensure_string(record['slug'], "Project manifest #{label}.slug"),
          kind: kind,
          title: SiteKit::Core::Helpers.ensure_string(record['title'], "Project manifest #{label}.title"),
          description: SiteKit::Core::Helpers.ensure_string(record['description'],
                                                            "Project manifest #{label}.description"),
          route_base: SiteKit::Core::Helpers.ensure_string(record['route_base'],
                                                           "Project manifest #{label}.route_base"),
          entry_url: record['entry_url'].to_s,
          source_url: SiteKit::Core::Helpers.ensure_string(record['source_url'],
                                                           "Project manifest #{label}.source_url"),
          source_repo_path: SiteKit::Core::Helpers.ensure_string(record['source_repo_path'],
                                                                 "Project manifest #{label}.source_repo_path"),
          source_optional: SiteKit::Core::Helpers.ensure_boolean_or_nil(record['source_optional'],
                                                                        "Project manifest #{label}.source_optional"),
          homepage_order: SiteKit::Core::Helpers.ensure_integer_or_nil(
            record['homepage_order'],
            "Project manifest #{label}.homepage_order"
          ) || 999
        )
      end

      def valid_kinds
        [EUREKA_PROJECT_KIND, SOURCE_NOTES_PROJECT_KIND]
      end

      def validate_unique!(manifests, &)
        SiteKit::Core::Helpers.ensure_unique!(manifests.map(&), 'Project manifest values must be unique')
      end
    end
  end
end

module SiteKit
  module Catalogs
    ProjectRegistryRecord = Data.define(:manifests) do
      def for_kind(kind)
        manifests.select { |manifest| manifest.kind == kind }
      end
    end

    class ProjectRegistry
      def initialize(records:, repo_root:)
        @records = records
        @repo_root = repo_root
      end

      def record
        @record ||= SiteKit::Catalogs::ProjectRegistryRecord.new(manifests: available_manifests)
      end

      private

      attr_reader :records, :repo_root

      def available_manifests
        SiteKit::Catalogs::ProjectManifestRepository.new(records).load.select do |manifest|
          source_available?(manifest)
        end
      end

      def source_available?(manifest)
        source_root = manifest.source_root(repo_root)
        return true if File.exist?(source_root)
        return false if manifest.source_optional?

        raise SiteKit::CatalogError, "Project '#{manifest.slug}' source is missing at '#{source_root}'"
      end
    end
  end
end

module SiteKit
  module Catalogs
    SiteProjectRecord = Data.define(
      :slug,
      :kind,
      :title,
      :description,
      :source_url,
      :homepage_order,
      :home_url,
      :home_groups
    ) do
      def to_h
        {
          'slug' => slug,
          'kind' => kind,
          'title' => title,
          'description' => description,
          'source_url' => source_url,
          'homepage_order' => homepage_order,
          'home_url' => home_url,
          'home_groups' => home_groups
        }
      end
    end

    class SiteProjectPresenter
      def initialize(manifests:, source_registries:)
        @manifests = manifests
        @source_registries = source_registries
      end

      def records
        manifests
          .sort_by(&:homepage_order)
          .map { |manifest| project_record(manifest).to_h }
      end

      private

      attr_reader :manifests, :source_registries

      def project_record(manifest)
        SiteKit::Catalogs::SiteProjectRecord.new(
          slug: manifest.slug,
          kind: manifest.kind,
          title: manifest.title,
          description: manifest.description,
          source_url: manifest.source_url,
          homepage_order: manifest.homepage_order,
          home_url: project_home_url(manifest),
          home_groups: homepage_groups(manifest)
        )
      end

      def project_home_url(manifest)
        return manifest.entry_url unless manifest.entry_url.empty?
        if manifest.kind == SOURCE_NOTES_PROJECT_KIND && source_registries.key?(manifest.slug)
          return source_registries.fetch(manifest.slug).fetch('project_home_url',
                                                              '')
        end

        ''
      end

      def homepage_groups(manifest)
        return [] unless manifest.kind == SOURCE_NOTES_PROJECT_KIND && source_registries.key?(manifest.slug)

        source_registries
          .fetch(manifest.slug)
          .fetch('languages', [])
          .map do |language|
            {
              'language_title' => language.fetch('language_title'),
              'modules' => language.fetch('modules').map do |module_record|
                {
                  'title' => module_record.fetch('title'),
                  'url' => module_record.fetch('url')
                }
              end
            }
          end
      end
    end
  end
end

# rubocop:enable Style/OneClassPerFile
