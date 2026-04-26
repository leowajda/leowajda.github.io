# frozen_string_literal: true

module SiteKit
  class SourceNotesPageFactory
    MODULE_PAGE_CONTEXT_KEYS = %w[slug module_slug title url readme_markdown roots].freeze
    MODULE_NAVIGATION_CONTEXT_KEYS = %w[slug module_slug title url roots].freeze
    DOCUMENT_CONTEXT_KEYS = %w[route_url title format body].freeze
    EMPTY_LINKS = [].freeze

    def initialize(manifest:, registry_record:)
      @manifest = manifest
      @registry_record = registry_record
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

    attr_reader :manifest, :registry_record

    def languages
      registry_record.fetch('languages')
    end

    def build_language_page(language)
      title = language.fetch('language_title')

      page(
        dir: "#{manifest.route_base}/#{language.fetch('language_slug')}/",
        page_type: SOURCE_LANGUAGE_PAGE_TYPE,
        data: {
          'redirect_to' => '/',
          'project_slug' => manifest.slug,
          'language_slug' => language.fetch('language_slug'),
          'title' => title,
          'description' => language_description(title),
          'sitemap' => false
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
        source_header: header_payload(eyebrow: language.fetch('language_title'), title:),
        source_schema: schema_payload(
          about: [registry_record.fetch('project_title'), language.fetch('language_title'), title],
          breadcrumbs: [breadcrumb('Home', '/'), breadcrumb(title, module_record.fetch('url'))]
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
        source_header: header_payload(eyebrow: module_record.fetch('title'), title:),
        source_schema: schema_payload(
          about: [registry_record.fetch('project_title'), module_record.fetch('title'),
                  language.fetch('language_title')],
          breadcrumbs: [
            breadcrumb('Home', '/'),
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

    def structured_data_partial(format)
      return STRUCTURED_DATA_SOURCE_DOCUMENT_CODE_PARTIAL if format == 'code'

      STRUCTURED_DATA_SOURCE_DOCUMENT_PARTIAL
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

    def breadcrumb(name, item)
      { 'name' => name, 'item' => item }
    end

    def header_payload(eyebrow:, title:)
      {
        'eyebrow' => eyebrow,
        'title' => title,
        'links' => EMPTY_LINKS
      }
    end

    def schema_payload(about:, breadcrumbs:, code_repository: nil, programming_language: nil)
      {
        'about' => about,
        'breadcrumbs' => breadcrumbs,
        'code_repository' => code_repository,
        'programming_language' => programming_language
      }.compact
    end

    def source_page_data(language_slug:, title:, source_header:, source_schema:, source_module:, module_slug: nil,
                         document_url: nil, source_document: nil, format: nil, structured_data_partial: nil)
      {
        'project_slug' => manifest.slug,
        'language_slug' => language_slug,
        'title' => title,
        'description' => "#{title} notes",
        'source_header' => source_header,
        'source_schema' => source_schema,
        'source_module' => source_module,
        'module_slug' => module_slug,
        'document_url' => document_url,
        'source_document' => source_document,
        'format' => format,
        'structured_data_partial' => structured_data_partial
      }.compact
    end

    def build_source_page(dir:, page_type:, **data)
      page(dir: dir, page_type: page_type, data: source_page_data(**data))
    end

    def language_description(title)
      "Source notes for #{title}."
    end

    def page(dir:, page_type:, data:)
      PageDefinition.build(dir: dir, page_type: page_type, data: data)
    end

    def slice_record(record, keys)
      keys.to_h do |key|
        [key, record.fetch(key)]
      end
    end
  end
end
