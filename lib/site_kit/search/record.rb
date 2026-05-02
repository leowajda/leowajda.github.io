# frozen_string_literal: true

module SiteKit
  module Search
    RECORD_REQUIRED_TEXT_FIELDS = %i[url content language].freeze

    Record = Data.define(:url, :content, :language, :meta, :filters, :sort) do
      def validate!
        validate_required_text_fields!
        validate_text_hash!(meta, 'meta')
        validate_filter_hash!
        validate_text_hash!(sort, 'sort')

        self
      end

      def to_h
        validate!

        {
          'url' => url,
          'content' => content,
          'language' => language,
          'meta' => meta,
          'filters' => filters,
          'sort' => sort
        }
      end

      private

      def validate_required_text_fields!
        SiteKit::Search::RECORD_REQUIRED_TEXT_FIELDS.each do |field|
          value = public_send(field)
          next if value.is_a?(String) && !value.empty?

          raise SiteKit::InvariantError, "Search record #{field} must be a non-empty string"
        end
      end

      def validate_text_hash!(hash, label)
        raise SiteKit::InvariantError, "Search record #{label} must be a flat hash" unless hash.is_a?(Hash)

        hash.each do |key, value|
          unless key.is_a?(String) && value.is_a?(String)
            raise SiteKit::InvariantError, "Search record #{label} values must be strings"
          end
        end
      end

      def validate_filter_hash!
        raise SiteKit::InvariantError, 'Search record filters must be a flat hash' unless filters.is_a?(Hash)

        filters.each do |key, values|
          unless key.is_a?(String) && values.is_a?(Array) && values.all?(String)
            raise SiteKit::InvariantError, 'Search record filter values must be arrays of strings'
          end
        end
      end
    end
  end
end
