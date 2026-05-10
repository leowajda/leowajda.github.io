# frozen_string_literal: true

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
        code_collection.required_array('implementation_modes')
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
