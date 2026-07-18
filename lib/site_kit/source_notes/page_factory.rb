# frozen_string_literal: true

module SiteKit
  module SourceNotes
    class PageFactory # rubocop:disable Metrics/ClassLength
      MODULE_PAGE_CONTEXT_KEYS = %w[slug module_slug title url readme_markdown roots].freeze
      MODULE_NAVIGATION_CONTEXT_KEYS = %w[slug module_slug title url roots].freeze
      DOCUMENT_CONTEXT_KEYS = %w[route_url title format body].freeze

      def initialize(manifest:, registry_record:)
        @manifest = manifest
        @registry_record = registry_record
        @paths = SiteKit::Core::ResourcePaths.new(route_base: manifest.route_base)
        @pages = SiteKit::Pages::DefinitionBuilder.new(project_slug: manifest.slug)
      end

      def home_page
        pages.build(
          dir: paths.root,
          page_type: SOURCE_HOME_PAGE_TYPE,
          title: registry_record.fetch('project_title'),
          description: registry_record.fetch('project_description'),
          data: {
            'source_home' => {
              'title' => registry_record.fetch('project_title'),
              'description' => registry_record.fetch('project_description'),
              'source_url' => registry_record.fetch('project_source_url'),
              'languages' => languages.map do |language|
                {
                  'slug' => language.fetch('language_slug'),
                  'title' => language.fetch('language_title'),
                  'url' => language.fetch('url'),
                  'modules' => language.fetch('modules').map do |module_record|
                    {
                      'title' => module_record.fetch('title'),
                      'url' => module_record.fetch('url')
                    }
                  end
                }
              end
            }
          }
        )
      end

      def language_pages
        languages.map { |language| build_language_page(language) }
      end

      def module_pages
        languages.flat_map do |language|
          language.fetch('modules').map { |module_record| build_module_page(language, module_record) }
        end
      end

      def document_pages
        languages.flat_map do |language|
          language.fetch('modules').flat_map do |module_record|
            module_record.fetch('documents').map { |document| build_document_page(language, module_record, document) }
          end
        end
      end

      private

      attr_reader :manifest, :registry_record, :paths, :pages

      def languages
        registry_record.fetch('languages')
      end

      def build_language_page(language)
        title = language.fetch('language_title')

        pages.build(
          dir: language.fetch('url'),
          page_type: SOURCE_LANGUAGE_PAGE_TYPE,
          title: title,
          description: "Source notes for #{title}.",
          data: {
            'language_slug' => language.fetch('language_slug'),
            'source_language' => {
              'slug' => language.fetch('language_slug'),
              'title' => title,
              'url' => language.fetch('url'),
              'source_url' => language.fetch('source_url'),
              'modules' => language.fetch('modules').map do |module_record|
                {
                  'title' => module_record.fetch('title'),
                  'url' => module_record.fetch('url')
                }
              end
            },
            'source_header' => header(eyebrow: registry_record.fetch('project_title'), title: title)
          }
        )
      end

      def build_module_page(language, module_record)
        title = module_record.fetch('title')

        build_source_page(
          dir: module_record.fetch('url'),
          page_type: SOURCE_MODULE_PAGE_TYPE,
          language_slug: language.fetch('language_slug'),
          module_slug: module_record.fetch('module_slug'),
          title:,
          source_header: header(eyebrow: language.fetch('language_title'), title:),
          source_schema: schema(
            about: [registry_record.fetch('project_title'), language.fetch('language_title'), title],
            breadcrumbs: [
              breadcrumb('Home', '/'),
              breadcrumb(registry_record.fetch('project_title'), paths.root),
              breadcrumb(language.fetch('language_title'), language.fetch('url')),
              breadcrumb(title, module_record.fetch('url'))
            ]
          ),
          source_module: module_page_context(module_record)
        )
      end

      def build_document_page(language, module_record, document)
        title = document.fetch('title')
        format = document.fetch('format')

        build_source_page(
          dir: document.fetch('route_url'),
          page_type: SOURCE_DOCUMENT_PAGE_TYPE,
          language_slug: language.fetch('language_slug'),
          module_slug: module_record.fetch('module_slug'),
          title:,
          source_header: header(eyebrow: module_record.fetch('title'), title:),
          source_schema: schema(
            about: [registry_record.fetch('project_title'), module_record.fetch('title'),
                    language.fetch('language_title')],
            breadcrumbs: [
              breadcrumb('Home', '/'),
              breadcrumb(registry_record.fetch('project_title'), paths.root),
              breadcrumb(language.fetch('language_title'), language.fetch('url')),
              breadcrumb(module_record.fetch('title'), module_record.fetch('url')),
              breadcrumb(title, document.fetch('route_url'))
            ],
            code_repository: registry_record.fetch('project_source_url'),
            programming_language: language.fetch('language_title')
          ),
          source_module: module_navigation_context(module_record),
          document_url: document.fetch('route_url'),
          source_document: document_context(document),
          format:,
          structured_data_partial: structured_data_partial(format)
        )
      end

      def build_source_page(dir:, page_type:, **data)
        title = data.fetch(:title)

        pages.build(
          dir: dir,
          page_type: page_type,
          title: title,
          description: "#{title} notes",
          data: source_page_data(data)
        )
      end

      def source_page_data(payload)
        {
          'language_slug' => payload.fetch(:language_slug),
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
          'links' => []
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

      def slice_record(record, keys)
        keys.to_h do |key|
          [key, record.fetch(key)]
        end
      end
    end
  end
end
