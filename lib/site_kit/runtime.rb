# frozen_string_literal: true

module SiteKit
  # Single build entry: load catalogs, compile, emit page hashes.
  class Runtime
    CACHE_KEY = '__site_kit_runtime'

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

    def page_links
      @page_links ||= SiteKit::Pages::LinkResolver.new(
        site_pages: site.data.fetch('site').fetch('pages'),
        page_links: site.data.fetch('site').fetch('page_links')
      )
    end

    def site_projects
      @site_projects ||= SiteKit::Catalogs::SiteProjectPresenter.new(
        manifests: project_registry.manifests,
        source_registries: source_notes.registries
      ).records
    end

    def eureka
      @eureka ||= SiteKit::Eureka::Context.new(
        manifests: project_registry.for_kind(EUREKA_PROJECT_KIND),
        app_config: app_config,
        template_library: templates,
        flowchart_data: flowchart_data,
        page_link_resolver: page_links
      )
    end

    def source_notes
      @source_notes ||= SiteKit::SourceNotes::Context.new(
        manifests: project_registry.for_kind(SOURCE_NOTES_PROJECT_KIND),
        app_config: app_config
      )
    end

    def templates
      @templates ||= SiteKit::Templates::LibraryContext.new(
        topics: eureka_data.fetch('topics', []),
        template_guide: eureka_data.fetch('template_guide', {}),
        flowchart_data: flowchart_data,
        code_source_root: File.join(SiteKit::Core::Helpers.repo_root, 'sources', 'templates'),
        language_catalog: eureka_data.fetch('template_languages', {}),
        code_collection_config: app_config.code_collection
      )
    end

    def flowchart_data
      @flowchart_data ||= SiteKit::Compile::Flowchart.layout(eureka_data.fetch('flowchart', {}))
    end

    def generated_pages
      @generated_pages ||= begin
        pages = eureka.generated_pages + source_notes.generated_pages
        SiteKit::Emit.validate_pages!(pages)
        pages
      end
    end

    def search_records
      @search_records ||= SiteKit::Extras::Pagefind.records(
        template_guide: templates.guide,
        flowchart: flowchart_data,
        flowchart_summaries: eureka_data.fetch('flowchart_summaries', {})
      )
    end

    def validate!
      generated_pages
      templates
      eureka.browsers
      source_notes.registries
      nil
    end

    # Compatibility aliases used during transition / tests.
    alias page_link_resolver page_links
    alias eureka_context eureka
    alias source_notes_context source_notes
    alias template_library_context templates

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
  end
end
