# frozen_string_literal: true

require 'nokogiri'

module SiteKit
  module Search
    class RecordFactory
      LANGUAGE = 'en'
      MAX_CONTENT_LENGTH = 8_000
      INPUT_DEFAULTS = {
        project: nil,
        summary: '',
        filters: {},
        meta: {},
        priority: 50
      }.freeze

      Input = Data.define(:kind, :title, :url, :content, :project, :summary, :filters, :meta, :priority) do
        def self.build(kind:, title:, url:, content:, **attributes)
          new(kind:, title:, url:, content:, **SiteKit::Search::RecordFactory::INPUT_DEFAULTS, **attributes)
        end
      end

      def build(**attributes)
        input = Input.build(**attributes)
        SiteKit::Search::Record.new(
          url: normalized_url(input.url),
          content: truncate_content(clean_text([input.title, input.summary, input.content])),
          language: LANGUAGE,
          meta: normalize_meta(base_meta(input).merge(input.meta)),
          filters: normalize_filters(base_filters(input).merge(input.filters)),
          sort: { 'priority' => input.priority.to_s }
        ).validate!
      end

      def clean_text(value)
        Array(value).flatten.join(' ').gsub(/\s+/, ' ').strip
      end

      def clean_html(value)
        Array(value).flatten.map do |entry|
          Nokogiri::HTML.fragment(entry.to_s).text
        end.join(' ').gsub(/\s+/, ' ').strip
      end

      private

      def truncate_content(content)
        return content if content.length <= MAX_CONTENT_LENGTH

        content[0, MAX_CONTENT_LENGTH].strip
      end

      def base_meta(input)
        {
          'title' => input.title,
          'kind' => input.kind,
          'project' => input.project.to_s,
          'summary' => input.summary.to_s
        }
      end

      def base_filters(input)
        {
          'kind' => input.kind,
          'project' => input.project.to_s
        }
      end

      def normalize_meta(meta)
        compact_text_hash(meta)
      end

      def normalize_filters(filters)
        filters.each_with_object({}) do |(key, value), result|
          values = Array(value).flatten.map { |entry| clean_text(entry) }.reject(&:empty?).uniq
          result[key] = values unless values.empty?
        end
      end

      def compact_text_hash(hash)
        SiteKit::Core::RecordHelpers.compact_hash(
          hash.transform_values do |value|
            clean_text(value)
          end
        )
      end

      def normalized_url(url)
        url = url.to_s
        return url if url.start_with?('/')

        "/#{url}"
      end
    end
  end
end
