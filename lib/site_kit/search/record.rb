# frozen_string_literal: true

require 'nokogiri'

module SiteKit
  module Search
    RECORD_REQUIRED_TEXT_FIELDS = %i[url content language].freeze
    RECORD_LANGUAGE = 'en'
    RECORD_MAX_CONTENT_LENGTH = 8_000
    RECORD_INPUT_DEFAULTS = { project: nil, summary: '', filters: {}, meta: {}, priority: nil }.freeze

    Record = Data.define(:url, :content, :language, :meta, :filters, :sort) do
      def self.build(kind:, title:, url:, content:, **attributes)
        attributes = SiteKit::Search::RECORD_INPUT_DEFAULTS.merge(attributes)
        SiteKit::Search::Contract.entry(kind)

        new(
          url: normalized_url(url),
          content: truncate_content(clean_text([title, attributes.fetch(:summary), content])),
          language: SiteKit::Search::RECORD_LANGUAGE,
          meta: compact_text_hash(base_meta(kind, title, attributes).merge(attributes.fetch(:meta))),
          filters: normalize_filters(base_filters(kind, attributes).merge(attributes.fetch(:filters))),
          sort: { 'priority' => priority_for(kind, attributes).to_s }
        ).validate!
      end

      def self.clean_text(value)
        Array(value).flatten.join(' ').gsub(/\s+/, ' ').strip
      end

      def self.clean_html(value)
        clean_text(Array(value).flatten.map { |entry| Nokogiri::HTML.fragment(entry.to_s).text })
      end

      def validate!
        validate_required_text_fields!
        validate_text_hash!(meta, 'meta')
        validate_filter_hash!
        validate_text_hash!(sort, 'sort')

        self
      end

      def to_h
        validate!

        { 'url' => url, 'content' => content, 'language' => language, 'meta' => meta, 'filters' => filters,
          'sort' => sort }
      end

      private

      def self.truncate_content(content)
        return content if content.length <= SiteKit::Search::RECORD_MAX_CONTENT_LENGTH

        content[0, SiteKit::Search::RECORD_MAX_CONTENT_LENGTH].strip
      end

      def self.base_meta(kind, title, attributes)
        { 'title' => title, 'kind' => kind, 'project' => attributes.fetch(:project).to_s,
          'summary' => attributes.fetch(:summary).to_s }
      end

      def self.base_filters(kind, attributes)
        { SiteKit::Search::Contract::FILTER_KIND => kind,
          SiteKit::Search::Contract::FILTER_PROJECT => attributes.fetch(:project).to_s }
      end

      def self.priority_for(kind, attributes)
        attributes.fetch(:priority) || SiteKit::Search::Contract.priority(kind)
      end

      def self.normalize_filters(filters)
        filters.each_with_object({}) do |(key, value), result|
          values = Array(value).flatten.map { |entry| clean_text(entry) }.reject(&:empty?).uniq
          result[key] = values unless values.empty?
        end
      end

      def self.compact_text_hash(hash)
        SiteKit::Core::RecordHelpers.compact_hash(
          hash.transform_values do |value|
            clean_text(value)
          end
        )
      end

      def self.normalized_url(url)
        url = url.to_s
        return url if url.start_with?('/', 'https://', 'http://')

        "/#{url}"
      end

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
