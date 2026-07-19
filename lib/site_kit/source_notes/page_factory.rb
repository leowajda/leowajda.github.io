# frozen_string_literal: true

module SiteKit
  module SourceNotes
    class PageFactory # rubocop:disable Metrics/ClassLength
      def initialize(manifest:, registry_record:)
        @manifest = manifest
        @registry_record = registry_record
        @paths = SiteKit::Core::ResourcePaths.new(route_base: manifest.route_base)
      end

      def home_page
        SiteKit::Emit.page(
          project_slug: manifest.slug,
          dir: paths.root,
          page_type: SOURCE_HOME_PAGE_TYPE,
          title: registry_record.fetch('project_title'),
          description: registry_record.fetch('project_description'),
          data: {
            'source_home' => {
              'title' => registry_record.fetch('project_title'),
              'description' => registry_record.fetch('project_description'),
              'source_url' => registry_record.fetch('project_source_url'),
              'languages' => languages.map { |language| language_summary(language) }
            }
          }
        )
      end

      def language_pages
        languages.map do |language|
          title = language.fetch('language_title')
          SiteKit::Emit.page(
            project_slug: manifest.slug,
            dir: language.fetch('url'),
            page_type: SOURCE_LANGUAGE_PAGE_TYPE,
            title: title,
            description: "Source notes for #{title}.",
            data: {
              'language_slug' => language.fetch('language_slug'),
              'source_language' => language_summary(language).merge(
                'source_url' => language.fetch('source_url')
              ),
              'source_header' => header(registry_record.fetch('project_title'), title)
            }
          )
        end
      end

      def module_pages
        each_module.map do |language, module_record|
          title = module_record.fetch('title')
          crumbs = [
            crumb('Home', '/'),
            crumb(registry_record.fetch('project_title'), paths.root),
            crumb(language.fetch('language_title'), language.fetch('url')),
            crumb(title, module_record.fetch('url'))
          ]
          emit(
            dir: module_record.fetch('url'),
            page_type: SOURCE_MODULE_PAGE_TYPE,
            title: title,
            language_slug: language.fetch('language_slug'),
            module_slug: module_record.fetch('module_slug'),
            header: header(language.fetch('language_title'), title),
            schema: schema(
              [registry_record.fetch('project_title'), language.fetch('language_title'), title],
              crumbs
            ),
            source_module: slice(module_record, %w[slug module_slug title url readme_markdown roots])
          )
        end
      end

      def document_pages # rubocop:disable Metrics/AbcSize,Metrics/MethodLength
        each_module.flat_map do |language, module_record|
          module_record.fetch('documents').map do |document|
            title = document.fetch('title')
            format = document.fetch('format')
            crumbs = [
              crumb('Home', '/'),
              crumb(registry_record.fetch('project_title'), paths.root),
              crumb(language.fetch('language_title'), language.fetch('url')),
              crumb(module_record.fetch('title'), module_record.fetch('url')),
              crumb(title, document.fetch('route_url'))
            ]
            emit(
              dir: document.fetch('route_url'),
              page_type: SOURCE_DOCUMENT_PAGE_TYPE,
              title: title,
              language_slug: language.fetch('language_slug'),
              module_slug: module_record.fetch('module_slug'),
              header: header(module_record.fetch('title'), title),
              schema: schema(
                [registry_record.fetch('project_title'), module_record.fetch('title'),
                 language.fetch('language_title')],
                crumbs,
                code_repository: registry_record.fetch('project_source_url'),
                programming_language: language.fetch('language_title')
              ),
              source_module: slice(module_record, %w[slug module_slug title url roots]),
              document_url: document.fetch('route_url'),
              source_document: slice(document, %w[route_url title format body]),
              format: format,
              structured_data_partial: document_structured_data(format)
            )
          end
        end
      end

      private

      attr_reader :manifest, :registry_record, :paths

      def languages
        registry_record.fetch('languages')
      end

      def each_module
        languages.flat_map { |language| language.fetch('modules').map { |mod| [language, mod] } }
      end

      def language_summary(language)
        {
          'slug' => language.fetch('language_slug'),
          'title' => language.fetch('language_title'),
          'url' => language.fetch('url'),
          'modules' => language.fetch('modules').map do |mod|
            { 'title' => mod.fetch('title'), 'url' => mod.fetch('url') }
          end
        }
      end

      def emit(dir:, page_type:, title:, language_slug:, header:, schema:, source_module:, **extra) # rubocop:disable Metrics/ParameterLists
        SiteKit::Emit.page(
          project_slug: manifest.slug,
          dir: dir,
          page_type: page_type,
          title: title,
          description: "#{title} notes",
          data: {
            'language_slug' => language_slug,
            'source_header' => header,
            'source_schema' => schema,
            'source_module' => source_module,
            'module_slug' => extra[:module_slug],
            'document_url' => extra[:document_url],
            'source_document' => extra[:source_document],
            'format' => extra[:format],
            'structured_data_partial' => extra[:structured_data_partial]
          }.compact
        )
      end

      def header(eyebrow, title)
        { 'eyebrow' => eyebrow, 'title' => title, 'links' => [] }
      end

      def schema(about, breadcrumbs, code_repository: nil, programming_language: nil)
        {
          'about' => about,
          'breadcrumbs' => breadcrumbs,
          'code_repository' => code_repository,
          'programming_language' => programming_language
        }.compact
      end

      def crumb(name, item)
        { 'name' => name, 'item' => item }
      end

      def slice(record, keys)
        keys.to_h { |key| [key, record.fetch(key)] }
      end

      def document_structured_data(format)
        return STRUCTURED_DATA_SOURCE_DOCUMENT_CODE_PARTIAL if format == 'code'

        STRUCTURED_DATA_SOURCE_DOCUMENT_PARTIAL
      end
    end
  end
end
