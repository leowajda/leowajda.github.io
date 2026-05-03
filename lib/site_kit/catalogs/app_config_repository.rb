# frozen_string_literal: true

module SiteKit
  module Catalogs
    AppEurekaBrowserConfig = Data.define(
      :toolbar_label,
      :variant_group_label,
      :variant_group_visibility,
      :variant_presentation
    )
    AppEurekaConfig = Data.define(
      :catalog_version,
      :metadata_keys,
      :implementation_keys,
      :browser
    )
    AppSourceNotesConfig = Data.define(
      :catalog_version,
      :ignored_directories,
      :text_file_metadata
    )
    AppCodeCollectionConfig = Data.define(
      :default_variant_label,
      :default_toolbar_label,
      :variant_icons,
      :implementation_modes
    )
    AppConfig = Data.define(:eureka, :source_notes, :code_collection)

    class AppConfigRepository
      TEXT_FILE_FORMATS = %w[code markdown].freeze

      def initialize(data_record)
        @data_record = SiteKit::Core::Helpers.ensure_hash(data_record, 'site data.site.app')
      end

      def load
        config = SiteKit::Catalogs::AppConfig.new(
          eureka: eureka_config,
          source_notes: source_notes_config,
          code_collection: code_collection_config
        )
        validate_text_file_metadata!(config.source_notes.text_file_metadata)
        config
      end

      private

      attr_reader :data_record

      def eureka_config
        record = section('eureka')
        browser = SiteKit::Core::Helpers.ensure_hash(record.fetch('browser'), 'site data.site.app.eureka.browser')
        SiteKit::Catalogs::AppEurekaConfig.new(
          catalog_version: record.fetch('catalog_version'),
          metadata_keys: record.fetch('metadata_keys'),
          implementation_keys: record.fetch('implementation_keys'),
          browser: SiteKit::Catalogs::AppEurekaBrowserConfig.new(
            toolbar_label: browser.fetch('toolbar_label'),
            variant_group_label: browser.fetch('variant_group_label'),
            variant_group_visibility: browser.fetch('variant_group_visibility'),
            variant_presentation: browser.fetch('variant_presentation')
          )
        )
      end

      def source_notes_config
        record = section('source_notes')
        SiteKit::Catalogs::AppSourceNotesConfig.new(
          catalog_version: record.fetch('catalog_version'),
          ignored_directories: record.fetch('ignored_directories'),
          text_file_metadata: text_file_metadata(record)
        )
      end

      def code_collection_config
        record = section('code_collection')
        SiteKit::Catalogs::AppCodeCollectionConfig.new(
          default_variant_label: record.fetch('default_variant_label'),
          default_toolbar_label: record.fetch('default_toolbar_label'),
          variant_icons: record.fetch('variant_icons'),
          implementation_modes: record.fetch('implementation_modes')
        )
      end

      def section(key)
        SiteKit::Core::Helpers.ensure_hash(data_record.fetch(key), "site data.site.app.#{key}")
      end

      def text_file_metadata(record)
        SiteKit::Core::Helpers.ensure_hash(
          record.fetch('text_file_metadata'),
          'site data.site.app.source_notes.text_file_metadata'
        )
      end

      def validate_text_file_metadata!(metadata)
        metadata.each do |extension, record|
          unless extension.start_with?('.')
            raise SiteKit::ConfigurationError,
                  "source_notes.text_file_metadata key '#{extension}' must start with ."
          end

          format = record.fetch('format')
          unless TEXT_FILE_FORMATS.include?(format)
            raise SiteKit::ConfigurationError,
                  "source_notes.text_file_metadata.#{extension}.format must be code or markdown"
          end

          syntax = record.fetch('syntax')
          if format == 'code' && syntax.empty?
            raise SiteKit::ConfigurationError,
                  "source_notes.text_file_metadata.#{extension}.syntax must not be empty for code files"
          end
        end
      end
    end
  end
end
