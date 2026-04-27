# frozen_string_literal: true

module SiteKit
  class SearchSourceRecordBuilder
    KIND = 'Source'

    def initialize(registries:, factory:)
      @registries = registries
      @factory = factory
    end

    def records
      registries.values.flat_map do |registry|
        registry.fetch('languages').flat_map do |language|
          language.fetch('modules').flat_map { |source_module| module_records(registry, language, source_module) }
        end
      end
    end

    private

    attr_reader :registries, :factory

    def module_records(registry, language, source_module)
      [
        module_record(registry, language, source_module),
        *document_records(registry, language, source_module)
      ].compact
    end

    def module_record(registry, language, source_module)
      body = source_module.fetch('readme_markdown', '').to_s
      return nil if body.strip.empty?

      factory.build(
        kind: KIND,
        title: source_module.fetch('title'),
        url: source_module.fetch('url'),
        project: registry.fetch('project_title'),
        summary: "#{language.fetch('language_title')} source notes.",
        content: [source_module.fetch('title'), body],
        filters: {
          'language' => language.fetch('language_title'),
          'module' => source_module.fetch('title')
        },
        priority: 65
      )
    end

    def document_records(registry, language, source_module)
      source_module.fetch('documents').map do |document|
        document_record(registry, language, source_module, document)
      end
    end

    def document_record(registry, language, source_module, document)
      factory.build(
        kind: KIND,
        title: document.fetch('title'),
        url: document.fetch('url'),
        project: registry.fetch('project_title'),
        summary: "#{source_module.fetch('title')}: #{document.fetch('tree_path')}",
        content: [
          document.fetch('title'),
          document.fetch('tree_path'),
          document.fetch('body')
        ],
        filters: {
          'language' => language.fetch('language_title'),
          'module' => source_module.fetch('title'),
          'source_format' => document.fetch('format')
        },
        priority: 55
      )
    end
  end
end
