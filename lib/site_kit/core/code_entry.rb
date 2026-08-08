# frozen_string_literal: true

module SiteKit
  module Core
    module CodeEntry
      module_function

      REQUIRED = %w[
        entry_id
        language
        language_label
        variant
        variant_label
        code
        code_language
      ].freeze

      OPTIONAL = %w[source_url detail_url embed_url].freeze

      def normalize(raw, context:)
        record = SiteKit::Core::Helpers.ensure_hash(raw, context)
        entry = {
          'entry_id' => SiteKit::Core::Helpers.ensure_string(record.fetch('entry_id'), "#{context}.entry_id"),
          'language' => SiteKit::Core::Helpers.ensure_string(record.fetch('language'), "#{context}.language"),
          'language_label' => SiteKit::Core::Helpers.ensure_string(
            record.fetch('language_label'),
            "#{context}.language_label"
          ),
          'variant' => SiteKit::Core::Helpers.ensure_string(record.fetch('variant'), "#{context}.variant"),
          'variant_label' => SiteKit::Core::Helpers.ensure_string(
            record.fetch('variant_label'),
            "#{context}.variant_label"
          ),
          'code' => SiteKit::Core::Helpers.ensure_string(record.fetch('code'), "#{context}.code"),
          'code_language' => SiteKit::Core::Helpers.ensure_string(
            record.fetch('code_language'),
            "#{context}.code_language"
          )
        }
        OPTIONAL.each do |key|
          value = record[key].to_s
          entry[key] = value unless value.empty?
        end
        entry
      end

      def with_urls(entry, detail_url:, embed_url:)
        entry.merge(
          'detail_url' => detail_url,
          'embed_url' => embed_url
        )
      end
    end
  end
end
