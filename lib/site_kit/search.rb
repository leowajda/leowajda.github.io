# frozen_string_literal: true

# rubocop:disable Style/OneClassPerFile, Metrics/ModuleLength, Metrics/ParameterLists

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

module SiteKit
  module Extras
    module Pagefind # rubocop:disable Metrics/ModuleLength
      module_function

      LANGUAGE = 'en'
      MAX_CONTENT_LENGTH = 8_000

      def records(template_guide:)
        template_records(template_guide)
      end

      def template_records(guide)
        guide.fetch('patterns').flat_map do |pattern|
          [pattern_record(pattern), *variant_records(pattern)]
        end
      end

      def pattern_record(pattern)
        build_record(
          kind: 'Template',
          title: pattern.fetch('label'),
          url: "#{SiteKit::TEMPLATES_URL}##{pattern.fetch('target')}",
          summary: pattern.fetch('description'),
          content: [
            pattern.fetch('label'),
            pattern.fetch('description'),
            pattern.fetch('variants').map { |variant| variant.fetch('label') },
            pattern.fetch('variants').flat_map { |variant| variant.fetch('aliases', []) }
          ],
          filters: { 'template' => pattern.fetch('label') },
          meta: {
            'target' => pattern.fetch('target'),
            'pattern' => pattern.fetch('id'),
            'section' => 'Pattern'
          },
          priority: 85
        )
      end

      def variant_records(pattern)
        pattern.fetch('variants').select { |variant| variant.fetch('has_template') }.map do |variant|
          title = reference_label(pattern, variant)
          build_record(
            kind: 'Template',
            title: title,
            url: "#{SiteKit::TEMPLATES_URL}##{variant.fetch('target')}",
            summary: variant.fetch('signal', ''),
            content: [
              title,
              pattern.fetch('description'),
              variant.fetch('description', ''),
              variant.fetch('signal', ''),
              variant.fetch('aliases', []),
              variant.fetch('target'),
              variant.dig('template', 'title'),
              variant.dig('template', 'description')
            ],
            filters: { 'template' => [pattern.fetch('label'), title] },
            meta: {
              'target' => variant.fetch('target'),
              'pattern' => pattern.fetch('id'),
              'section' => pattern.fetch('label')
            },
            priority: 95
          )
        end
      end

      def build_record(kind:, title:, url:, content:, summary: '', filters: {}, meta: {}, priority: 50) # rubocop:disable Metrics/ParameterLists
        SiteKit::Search::Record.new(
          url: normalized_url(url),
          content: truncate_content(clean_text([title, summary, content])),
          language: LANGUAGE,
          meta: compact_text_hash(
            {
              'title' => title,
              'kind' => kind,
              'project' => 'Eureka',
              'summary' => summary.to_s
            }.merge(meta)
          ),
          filters: normalize_filters({ 'kind' => kind, 'project' => 'Eureka' }.merge(filters)),
          sort: { 'priority' => priority.to_s }
        ).validate!
      end

      def reference_label(pattern, variant = nil)
        parts = [pattern.fetch('label').to_s.strip]
        parts << variant.fetch('label').to_s.strip if variant
        parts.reject(&:empty?).join(' ')
      end

      def clean_text(value)
        Array(value).flatten.join(' ').gsub(/\s+/, ' ').strip
      end

      def truncate_content(content)
        return content if content.length <= MAX_CONTENT_LENGTH

        content[0, MAX_CONTENT_LENGTH].strip
      end

      def normalize_filters(filters)
        filters.each_with_object({}) do |(key, value), result|
          values = Array(value).flatten.map { |entry| clean_text(entry) }.reject(&:empty?).uniq
          result[key] = values unless values.empty?
        end
      end

      def compact_text_hash(hash)
        SiteKit::Core::RecordHelpers.compact_hash(hash.transform_values { |value| clean_text(value) })
      end

      def normalized_url(url)
        url = url.to_s
        return url if url.start_with?('/', 'https://', 'http://')

        "/#{url}"
      end
    end
  end
end

# rubocop:enable Style/OneClassPerFile, Metrics/ModuleLength, Metrics/ParameterLists
