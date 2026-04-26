# frozen_string_literal: true

module SiteKit
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

    EUREKA_SCHEMA = {
      catalog_version: :integer,
      metadata_keys: :string_array,
      implementation_keys: :string_array,
      browser: lambda { |value, context, repository|
        repository.__send__(
          :build_data_record,
          AppEurekaBrowserConfig,
          Helpers.ensure_hash(value, context),
          context,
          toolbar_label: :string,
          variant_group_label: :string,
          variant_group_visibility: :string,
          variant_presentation: :string
        )
      }
    }.freeze
    SOURCE_NOTES_SCHEMA = {
      catalog_version: :integer,
      ignored_directories: :string_array,
      text_file_metadata: :string_hash_map
    }.freeze
    CODE_COLLECTION_SCHEMA = {
      default_variant_label: :string,
      default_toolbar_label: :string,
      variant_icons: :string_hash,
      implementation_modes: :string_hash_array
    }.freeze

    def initialize(data_record)
      @data_record = Helpers.ensure_hash(data_record, 'site data.site.app')
    end

    def load
      config = AppConfig.new(
        eureka: section_record(AppEurekaConfig, 'eureka', EUREKA_SCHEMA),
        source_notes: section_record(AppSourceNotesConfig, 'source_notes', SOURCE_NOTES_SCHEMA),
        code_collection: section_record(AppCodeCollectionConfig, 'code_collection', CODE_COLLECTION_SCHEMA)
      )
      validate_text_file_metadata!(config.source_notes.text_file_metadata)
      config
    end

    private

    attr_reader :data_record

    def section_record(klass, key, schema)
      build_data_record(
        klass,
        Helpers.ensure_hash(data_record.fetch(key), "site data.site.app.#{key}"),
        "site data.site.app.#{key}",
        **schema
      )
    end

    def build_data_record(klass, record, context, **schema)
      klass.new(**schema.to_h do |field, loader|
        value = record.fetch(field.to_s)
        [field, load_value(loader, value, "#{context}.#{field}")]
      end)
    end

    def load_value(loader, value, context)
      case loader
      when :integer then Helpers.ensure_integer(value, context)
      when :string then Helpers.ensure_string(value, context)
      when :string_array then Helpers.ensure_array_of_strings(value, context)
      when :string_hash then string_hash(value, context)
      when :string_hash_array then string_hash_array(value, context)
      when :string_hash_map then string_hash_map(value, context)
      else loader.call(value, context, self)
      end
    end

    def string_hash_array(value, context)
      Helpers.ensure_array(value, context).map.with_index do |entry, index|
        string_hash(entry, "#{context}[#{index}]")
      end
    end

    def string_hash_map(value, context)
      Helpers.ensure_hash(value, context).transform_values do |entry|
        string_hash(entry, "#{context} entry")
      end
    end

    def string_hash(value, context)
      Helpers.ensure_hash(value, context).to_h do |key, entry|
        [Helpers.ensure_string(key, "#{context} key"), Helpers.ensure_string(entry, "#{context}.#{key}")]
      end
    end

    def validate_text_file_metadata!(metadata)
      metadata.each do |extension, record|
        raise "source_notes.text_file_metadata key '#{extension}' must start with ." unless extension.start_with?('.')

        format = record.fetch('format')
        unless TEXT_FILE_FORMATS.include?(format)
          raise "source_notes.text_file_metadata.#{extension}.format must be code or markdown"
        end

        syntax = record.fetch('syntax')
        if format == 'code' && syntax.empty?
          raise "source_notes.text_file_metadata.#{extension}.syntax must not be empty for code files"
        end
      end
    end
  end
end
