# frozen_string_literal: true

module SiteKit
  module Templates
    module CodeCollections
      class Registry
        MAX_CODE_LINES = 180
        DISALLOWED_CODE_PATTERNS = [
          /^\s*package\s+/,
          /^\s*import\s+/,
          /^\s*#include\s+/,
          /^\s*using namespace\s+/,
          /class Solution/
        ].freeze

        def initialize(templates:, entries_by_template:, language_catalog:, code_collection_config:)
          @templates = templates
          @entries_by_template = entries_by_template
          @language_catalog = normalize_language_catalog(language_catalog)
          @code_collection_config = code_collection_config
        end

        def record
          @record ||= begin
            validate_known_template_entries!

            templates.to_h do |template|
              [template.template_id, code_collection_for(template)]
            end
          end
        end

        private

        attr_reader :templates, :entries_by_template, :language_catalog, :code_collection_config

        def validate_known_template_entries!
          known_template_ids = templates.map(&:template_id)
          stray_entry_ids = entries_by_template.keys.map(&:to_s) - known_template_ids
          return if stray_entry_ids.empty?

          raise SiteKit::CatalogError,
                "Template entries reference unknown templates: #{stray_entry_ids.sort.join(', ')}"
        end

        def code_collection_for(template)
          entries = entries_for(template)
          validate_unique_entry_ids!(template.template_id, entries)
          validate_unique_language_variants!(template.template_id, entries)
          validate_language_coverage!(template.template_id, entries)

          SiteKit::Templates::CodeCollections::Model.build(
            entries: entries,
            default_entry_id: entries.first && entries.first['entry_id'],
            options: SiteKit::Templates::CodeCollections::Options.build(
              toolbar_aria: code_collection_config.default_toolbar_label,
              variant_group_label: code_collection_config.default_variant_label,
              variant_icon_map: code_collection_config.variant_icons
            )
          )
        end

        def entries_for(template)
          SiteKit::Core::Helpers.ensure_array(
            entries_by_template.fetch(template.template_id) do
              raise SiteKit::CatalogError, "Template '#{template.template_id}' is missing code entries"
            end,
            "Template entries for #{template.template_id}"
          ).map.with_index do |entry, index|
            normalize_entry(entry,
                            "Template entries for #{template.template_id}[#{index}]",
                            template.template_id)
          end
        end

        def normalize_language_catalog(value)
          SiteKit::Core::Helpers.ensure_hash(value, 'Template language catalog').transform_values do |entry|
            record = SiteKit::Core::Helpers.ensure_hash(entry, 'Template language catalog entry')
            {
              'label' => SiteKit::Core::Helpers.ensure_string(record.fetch('label'),
                                                              'Template language catalog entry.label'),
              'code_language' => SiteKit::Core::Helpers.ensure_string(
                record.fetch('code_language'),
                'Template language catalog entry.code_language'
              )
            }
          end
        end

        def normalize_entry(entry, context, template_id)
          record = SiteKit::Core::Helpers.ensure_hash(entry, context)
          entry_id = SiteKit::Core::Helpers.ensure_string(record.fetch('entry_id'), "#{context}.entry_id")
          validate_entry_id_prefix!(template_id, entry_id)
          language = SiteKit::Core::Helpers.ensure_string(record.fetch('language'), "#{context}.language")
          language_record = language_catalog.fetch(language) do
            raise SiteKit::CatalogError, "#{context}.language references unknown template language '#{language}'"
          end
          code = SiteKit::Core::Helpers.ensure_string(record.fetch('code'), "#{context}.code")
          validate_code!(code, context)

          {
            'entry_id' => entry_id,
            'language' => language,
            'language_label' => SiteKit::Core::Helpers.ensure_string(
              record.fetch('language_label', language_record.fetch('label')),
              "#{context}.language_label"
            ),
            'code_language' => SiteKit::Core::Helpers.ensure_string(
              record.fetch('code_language', language_record.fetch('code_language')),
              "#{context}.code_language"
            ),
            'code' => code,
            'variant' => 'default',
            'variant_label' => 'Default'
          }
        end

        def validate_code!(code, context)
          stripped_code = code.strip
          raise SiteKit::CatalogError, "#{context}.code must not be empty" if stripped_code.empty?

          line_count = stripped_code.lines.size
          if line_count > MAX_CODE_LINES
            raise SiteKit::CatalogError,
                  "#{context}.code must stay within #{MAX_CODE_LINES} lines, got #{line_count}"
          end

          disallowed_pattern = DISALLOWED_CODE_PATTERNS.find { |pattern| code.match?(pattern) }
          return unless disallowed_pattern

          raise SiteKit::CatalogError,
                "#{context}.code includes non-template boilerplate matching #{disallowed_pattern.inspect}"
        end

        def validate_entry_id_prefix!(template_id, entry_id)
          return if entry_id.start_with?("#{template_id}-")

          raise SiteKit::CatalogError,
                "Template '#{template_id}' code entry id '#{entry_id}' must start with '#{template_id}-'"
        end

        def validate_unique_entry_ids!(template_id, entries)
          SiteKit::Core::Helpers.ensure_unique!(
            entries.map { |entry| entry.fetch('entry_id') },
            "Template '#{template_id}' code entry ids must be unique"
          )
        end

        def validate_unique_language_variants!(template_id, entries)
          duplicate_language_variants = SiteKit::Core::Helpers.duplicates(
            entries.map { |entry| [entry.fetch('language'), entry.fetch('variant', 'default')] }
          )
          duplicate_pairs = duplicate_language_variants.map { |language, variant| "#{language}/#{variant}" }
          return if duplicate_pairs.empty?

          raise SiteKit::CatalogError,
                "Template '#{template_id}' language and variant pairs must be unique: #{duplicate_pairs.join(', ')}"
        end

        def validate_language_coverage!(template_id, entries)
          languages = entries.map { |entry| entry.fetch('language') }
          missing_languages = language_catalog.keys - languages
          extra_languages = languages - language_catalog.keys
          return if missing_languages.empty? && extra_languages.empty?

          messages = []
          messages << "missing #{missing_languages.join(', ')}" if missing_languages.any?
          messages << "unknown #{extra_languages.join(', ')}" if extra_languages.any?
          raise SiteKit::CatalogError,
                "Template '#{template_id}' must define every supported language: #{messages.join('; ')}"
        end
      end
    end
  end
end
