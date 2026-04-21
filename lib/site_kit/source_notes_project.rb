# frozen_string_literal: true

module SiteKit
  class SourceNotesProject
    def initialize(manifest:, app_config:)
      @manifest = manifest
      @app_config = app_config
    end

    def slug
      manifest.slug
    end

    def registry_record
      @registry_record ||= SourceNotesRegistryBuilder.new(
        manifest: manifest,
        app_config: app_config
      ).record
    end

    def generated_pages
      page_factory.language_pages + page_factory.module_pages + page_factory.document_pages
    end

    def generated_language_pages
      page_factory.language_pages
    end

    def generated_module_pages
      page_factory.module_pages
    end

    def generated_document_pages
      page_factory.document_pages
    end

    private

    attr_reader :manifest, :app_config

    def page_factory
      @page_factory ||= SourceNotesPageFactory.new(
        manifest: manifest,
        registry_record: registry_record
      )
    end
  end
end
