# frozen_string_literal: true

module SiteKit
  class BuildContext
    CACHE_KEY = "__site_kit_build_context"

    def self.for(site)
      site.config[CACHE_KEY] ||= new(site)
    end

    def initialize(site)
      @site = site
    end

    def app_config
      @app_config ||= AppConfigRepository.new(site.data.fetch("site").fetch("app")).load
    end

    def page_link_resolver
      @page_link_resolver ||= PageLinkResolver.new(
        site_pages: site.data.fetch("site").fetch("pages"),
        page_links: site.data.fetch("site").fetch("page_links")
      )
    end

    def site_projects
      @site_projects ||= SiteProjectPresenter.new(
        manifests: manifests,
        source_registries: source_notes_context.registries
      ).records
    end

    def eureka_context
      @eureka_context ||= EurekaContext.new(
        manifests: manifests_for(EUREKA_PROJECT_KIND),
        app_config: app_config,
        algorithmic_templates: template_library_context.templates,
        flowchart_data: eureka_data.fetch("flowchart", {}),
        page_link_resolver: page_link_resolver
      )
    end

    def source_notes_context
      @source_notes_context ||= SourceNotesContext.new(
        manifests: manifests_for(SOURCE_NOTES_PROJECT_KIND),
        app_config: app_config
      )
    end

    def template_library_context
      @template_library_context ||= TemplateLibraryContext.new(
        documents: site.collections.fetch(ALGORITHMIC_TEMPLATE_COLLECTION).docs,
        groups: eureka_data.fetch("template_groups", []),
        entries_by_template: eureka_data.fetch("template_entries", {}),
        code_collection_config: app_config.code_collection
      )
    end

    def generated_pages
      @generated_pages ||= eureka_context.generated_pages + source_notes_context.generated_pages
    end

    private

    attr_reader :site

    def manifests
      @manifests ||= ProjectManifestRepository.new(site.data["projects"]).load
    end

    def manifests_for(kind)
      @manifests_by_kind ||= {}
      @manifests_by_kind[kind] ||= manifests
        .select { |manifest| manifest.kind == kind }
        .select { |manifest| project_source_available?(manifest) }
    end

    def project_source_available?(manifest)
      source_root = manifest.source_root(Helpers.repo_root)
      return true if File.exist?(source_root)
      return false if manifest.source_optional?

      raise "Project '#{manifest.slug}' source is missing at '#{source_root}'"
    end

    def eureka_data
      @eureka_data ||= site.data.fetch(EUREKA_NAMESPACE, {})
    end
  end
end
