# frozen_string_literal: true

module SiteKit
  module SourceNotes
    class Project
      def initialize(manifest:, app_config:)
        @manifest = manifest
        @app_config = app_config
      end

      def slug
        manifest.slug
      end

      def registry_record
        @registry_record ||= SiteKit::SourceNotes::RegistryBuilder.new(
          manifest: manifest,
          app_config: app_config
        ).record
      end

      def generated_pages
        factory = page_factory
        [factory.home_page] + factory.language_pages + factory.module_pages + factory.document_pages
      end

      private

      attr_reader :manifest, :app_config

      def page_factory
        @page_factory ||= SiteKit::SourceNotes::PageFactory.new(
          manifest: manifest,
          registry_record: registry_record
        )
      end
    end
  end
end
