# frozen_string_literal: true

module SiteKit
  module SourceNotes
    class PagePayloadBuilder
      MODULE_PAGE_CONTEXT_KEYS = %w[slug module_slug title url readme_markdown roots].freeze
      MODULE_NAVIGATION_CONTEXT_KEYS = %w[slug module_slug title url roots].freeze
      DOCUMENT_CONTEXT_KEYS = %w[route_url title format body].freeze
      EMPTY_LINKS = [].freeze

      def initialize(manifest:, registry_record:)
        @manifest = manifest
        @registry_record = registry_record
      end

      def source_page_data(payload)
        {
          'project_slug' => manifest.slug,
          'language_slug' => payload.fetch(:language_slug),
          'title' => payload.fetch(:title),
          'description' => "#{payload.fetch(:title)} notes",
          'source_header' => payload.fetch(:source_header),
          'source_schema' => payload.fetch(:source_schema),
          'source_module' => payload.fetch(:source_module),
          'module_slug' => payload[:module_slug],
          'document_url' => payload[:document_url],
          'source_document' => payload[:source_document],
          'format' => payload[:format],
          'structured_data_partial' => payload[:structured_data_partial]
        }.compact
      end

      def module_page_context(module_record)
        slice_record(module_record, MODULE_PAGE_CONTEXT_KEYS)
      end

      def module_navigation_context(module_record)
        slice_record(module_record, MODULE_NAVIGATION_CONTEXT_KEYS)
      end

      def document_context(document)
        slice_record(document, DOCUMENT_CONTEXT_KEYS)
      end

      def header(eyebrow:, title:)
        {
          'eyebrow' => eyebrow,
          'title' => title,
          'links' => EMPTY_LINKS
        }
      end

      def schema(about:, breadcrumbs:, code_repository: nil, programming_language: nil)
        {
          'about' => about,
          'breadcrumbs' => breadcrumbs,
          'code_repository' => code_repository,
          'programming_language' => programming_language
        }.compact
      end

      def breadcrumb(name, item)
        { 'name' => name, 'item' => item }
      end

      def structured_data_partial(format)
        return STRUCTURED_DATA_SOURCE_DOCUMENT_CODE_PARTIAL if format == 'code'

        STRUCTURED_DATA_SOURCE_DOCUMENT_PARTIAL
      end

      private

      attr_reader :manifest, :registry_record

      def slice_record(record, keys)
        keys.to_h do |key|
          [key, record.fetch(key)]
        end
      end
    end
  end
end
