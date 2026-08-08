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

        def initialize(templates:, entries_by_template:, language_catalog:)
          @templates = templates
          @entries_by_template = entries_by_template
          @language_catalog = normalize_language_catalog(language_catalog)
          @paths = SiteKit::Core::ResourcePaths.new(route_base: 'templates')
        end

        def record
          @record ||= begin
            validate_known_template_entries!
            templates.to_h do |template|
              [template.template_id, entries_for(template)]
            end
          end
        end

        private

        attr_reader :templates, :entries_by_template, :language_catalog, :paths

        def validate_known_template_entries!
          known = templates.map(&:template_id)
          stray = entries_by_template.keys.map(&:to_s) - known
          return if stray.empty?

          raise SiteKit::CatalogError, "Template entries reference unknown templates: #{stray.sort.join(', ')}"
        end

        def entries_for(template)
          raw_entries = SiteKit::Core::Helpers.ensure_array(
            entries_by_template.fetch(template.template_id) do
              raise SiteKit::CatalogError, "Template '#{template.template_id}' is missing code entries"
            end,
            "Template entries for #{template.template_id}"
          )
          entries = raw_entries.map.with_index do |entry, index|
            normalize_entry(entry, "Template entries for #{template.template_id}[#{index}]", template.template_id)
          end
          validate_unique_entry_ids!(template.template_id, entries)
          validate_unique_language_variants!(template.template_id, entries)
          validate_language_coverage!(template.template_id, entries)
          entries
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

        def normalize_entry(entry, context, template_id) # rubocop:disable Metrics/MethodLength
          record = SiteKit::Core::Helpers.ensure_hash(entry, context)
          entry_id = SiteKit::Core::Helpers.ensure_string(record.fetch('entry_id'), "#{context}.entry_id")
          validate_entry_id_prefix!(template_id, entry_id)
          language = SiteKit::Core::Helpers.ensure_string(record.fetch('language'), "#{context}.language")
          language_record = language_catalog.fetch(language) do
            raise SiteKit::CatalogError, "#{context}.language references unknown template language '#{language}'"
          end
          code = SiteKit::Core::Helpers.ensure_string(record.fetch('code'), "#{context}.code")
          validate_code!(code, context)

          SiteKit::Core::CodeEntry.normalize(
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
              'variant_label' => 'Default',
              'detail_url' => SiteKit::TEMPLATES_URL,
              'embed_url' => paths.embed(template_id)
            },
            context: context
          )
        end

        def validate_code!(code, context)
          stripped = code.strip
          raise SiteKit::CatalogError, "#{context}.code must not be empty" if stripped.empty?

          line_count = stripped.lines.size
          if line_count > MAX_CODE_LINES
            raise SiteKit::CatalogError,
                  "#{context}.code must stay within #{MAX_CODE_LINES} lines, got #{line_count}"
          end

          pattern = DISALLOWED_CODE_PATTERNS.find { |candidate| code.match?(candidate) }
          return unless pattern

          raise SiteKit::CatalogError,
                "#{context}.code includes non-template boilerplate matching #{pattern.inspect}"
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
          pairs = entries.map { |entry| "#{entry.fetch('language')}/#{entry.fetch('variant')}" }
          duplicates = SiteKit::Core::Helpers.duplicates(pairs)
          return if duplicates.empty?

          raise SiteKit::CatalogError,
                "Template '#{template_id}' language and variant pairs must be unique: #{duplicates.join(', ')}"
        end

        def validate_language_coverage!(template_id, entries)
          languages = entries.map { |entry| entry.fetch('language') }
          missing = language_catalog.keys - languages
          extra = languages - language_catalog.keys
          return if missing.empty? && extra.empty?

          messages = []
          messages << "missing #{missing.join(', ')}" if missing.any?
          messages << "unknown #{extra.join(', ')}" if extra.any?
          raise SiteKit::CatalogError,
                "Template '#{template_id}' must define every supported language: #{messages.join('; ')}"
        end
      end
    end
  end
end
