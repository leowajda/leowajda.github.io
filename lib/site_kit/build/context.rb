# frozen_string_literal: true

module SiteKit
  module Build
    class Context
      CACHE_KEY = '__site_kit_build_context'

      def self.for(site)
        site.config[CACHE_KEY] ||= new(site)
      end

      def self.clear(site)
        site.config.delete(CACHE_KEY)
      end

      def initialize(site)
        @site = site
      end

      def app_config
        @app_config ||= SiteKit::Catalogs::AppConfigRepository.new(site.data.fetch('site').fetch('app')).load
      end

      def page_link_resolver
        @page_link_resolver ||= SiteKit::Pages::LinkResolver.new(
          site_pages: site.data.fetch('site').fetch('pages'),
          page_links: site.data.fetch('site').fetch('page_links')
        )
      end

      def site_projects
        @site_projects ||= SiteKit::Catalogs::SiteProjectPresenter.new(
          manifests: project_registry.manifests,
          source_registries: source_notes_context.registries
        ).records
      end

      def eureka_context
        @eureka_context ||= SiteKit::Eureka::Context.new(
          manifests: project_registry.for_kind(EUREKA_PROJECT_KIND),
          app_config: app_config,
          template_library: template_library_context,
          flowchart_data: flowchart_data,
          page_link_resolver: page_link_resolver
        )
      end

      def source_notes_context
        @source_notes_context ||= SiteKit::SourceNotes::Context.new(
          manifests: project_registry.for_kind(SOURCE_NOTES_PROJECT_KIND),
          app_config: app_config
        )
      end

      def template_library_context
        @template_library_context ||= SiteKit::Templates::LibraryContext.new(
          topics: eureka_data.fetch('topics', []),
          template_guide: eureka_data.fetch('template_guide', {}),
          flowchart_data: flowchart_data,
          code_source_root: File.join(SiteKit::Core::Helpers.repo_root, 'sources', 'templates'),
          language_catalog: eureka_data.fetch('template_languages', {}),
          code_collection_config: app_config.code_collection
        )
      end

      def flowchart_data
        @flowchart_data ||= SiteKit::Flowcharts::LayoutBuilder.new(flowchart_data: eureka_data.fetch('flowchart',
                                                                                                     {})).build
      end

      def generated_pages
        generated_page_registry.pages
      end

      def search_records
        @search_records ||= SiteKit::Search::IndexBuilder.new(context: self, site: site).records
      end

      def validate!
        SiteKit::Build::Validator.new(context: self).validate!
      end

      private

      attr_reader :site

      def project_registry
        @project_registry ||= SiteKit::Catalogs::ProjectRegistry.new(
          records: site.data['projects'],
          repo_root: SiteKit::Core::Helpers.repo_root
        ).record
      end

      def eureka_data
        @eureka_data ||= site.data.fetch(EUREKA_NAMESPACE, {})
      end

      def generated_page_registry
        @generated_page_registry ||= SiteKit::JekyllRuntime::GeneratedPageRegistry.new(
          eureka_context: eureka_context,
          source_notes_context: source_notes_context
        ).record
      end
    end
  end
end
