# frozen_string_literal: true

require 'nokogiri'

module SiteKit
  class SearchRecordFactory
    LANGUAGE = 'en'
    MAX_CONTENT_LENGTH = 8_000

    def build(kind:, title:, url:, content:, project: nil, summary: '', filters: {}, meta: {}, priority: 50)
      SearchRecord.new(
        url: normalized_url(url),
        content: truncate_content(clean_text([title, summary, content])),
        language: LANGUAGE,
        meta: normalize_meta(base_meta(kind:, title:, project:, summary:).merge(meta)),
        filters: normalize_filters(base_filters(kind:, project:).merge(filters)),
        sort: { 'priority' => priority.to_s }
      )
    end

    def clean_text(value)
      Array(value).flatten.map do |entry|
        text = entry.to_s
        text = Nokogiri::HTML.fragment(text).text if text.include?('<') && text.include?('>')
        text
      end.join(' ').gsub(/\s+/, ' ').strip
    end

    private

    def truncate_content(content)
      return content if content.length <= MAX_CONTENT_LENGTH

      content[0, MAX_CONTENT_LENGTH].strip
    end

    def base_meta(kind:, title:, project:, summary:)
      {
        'title' => title,
        'kind' => kind,
        'project' => project.to_s,
        'summary' => summary.to_s
      }
    end

    def base_filters(kind:, project:)
      {
        'kind' => kind,
        'project' => project.to_s
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
      RecordHelpers.compact_hash(
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
