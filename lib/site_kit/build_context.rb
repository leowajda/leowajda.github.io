# frozen_string_literal: true

module SiteKit
  class BuildContext
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
      @app_config ||= AppConfigRepository.new(site.data.fetch('site').fetch('app')).load
    end

    def page_link_resolver
      @page_link_resolver ||= PageLinkResolver.new(
        site_pages: site.data.fetch('site').fetch('pages'),
        page_links: site.data.fetch('site').fetch('page_links')
      )
    end

    def site_projects
      @site_projects ||= SiteProjectPresenter.new(
        manifests: project_registry.manifests,
        source_registries: source_notes_context.registries
      ).records
    end

    def eureka_context
      @eureka_context ||= EurekaContext.new(
        manifests: project_registry.for_kind(EUREKA_PROJECT_KIND),
        app_config: app_config,
        algorithmic_topics: template_library_context.topics,
        algorithmic_templates: template_library_context.templates,
        template_guide: template_library_context.guide,
        flowchart_data: flowchart_data,
        page_link_resolver: page_link_resolver
      )
    end

    def source_notes_context
      @source_notes_context ||= SourceNotesContext.new(
        manifests: project_registry.for_kind(SOURCE_NOTES_PROJECT_KIND),
        app_config: app_config
      )
    end

    def template_library_context
      @template_library_context ||= TemplateLibraryContext.new(
        topics: eureka_data.fetch('topics', []),
        template_guide: eureka_data.fetch('template_guide', {}),
        flowchart_data: flowchart_data,
        entries_by_template: eureka_data.fetch('template_entries', {}),
        language_catalog: eureka_data.fetch('template_languages', {}),
        code_collection_config: app_config.code_collection
      )
    end

    def flowchart_data
      @flowchart_data ||= FlowchartLayoutBuilder.new(flowchart_data: eureka_data.fetch('flowchart', {})).build
    end

    def generated_pages
      generated_page_registry.pages
    end

    def validate!
      BuildValidator.new(context: self).validate!
    end

    private

    attr_reader :site

    def project_registry
      @project_registry ||= ProjectRegistry.new(
        records: site.data['projects'],
        repo_root: Helpers.repo_root
      ).record
    end

    def eureka_data
      @eureka_data ||= site.data.fetch(EUREKA_NAMESPACE, {})
    end

    def generated_page_registry
      @generated_page_registry ||= GeneratedPageRegistry.new(
        eureka_context: eureka_context,
        source_notes_context: source_notes_context
      ).record
    end
  end
end
