# frozen_string_literal: true

module SiteKit
  class Build
    def self.for(site)
      return site.instance_variable_get(:@site_kit_build) if site.instance_variable_defined?(:@site_kit_build)

      site.instance_variable_set(:@site_kit_build, new(site))
    end

    def self.clear(site)
      return unless site.instance_variable_defined?(:@site_kit_build)

      site.remove_instance_variable(:@site_kit_build)
    end

    def initialize(site)
      @site = site
    end

    def pages
      @pages ||= begin
        list = eureka.generated_pages + source_notes.generated_pages + templates.embed_pages
        SiteKit::Emit.validate_pages!(list)
        list
      end
    end

    def search_extras
      @search_extras ||= SiteKit::Extras::Pagefind.records(template_guide: templates.guide)
    end

    alias search_records search_extras

    def explorer(project_slug)
      eureka.explorers.fetch(project_slug)
    end

    def guide
      templates.guide
    end

    def home_projects
      @home_projects ||= SiteKit::Catalogs::SiteProjectPresenter.new(
        manifests: project_registry.manifests,
        source_registries: source_notes.registries
      ).records
    end

    def validate!
      pages
      SiteKit::Invariants.check!(
        guide: guide,
        explorers: eureka.explorers,
        topics: eureka.topics
      )
      source_notes.registries
      nil
    end

    def app_config
      @app_config ||= SiteKit::Catalogs::AppConfigRepository.new(site.data.fetch('site').fetch('app')).load
    end

    def eureka
      @eureka ||= SiteKit::Eureka::Context.new(
        manifests: project_registry.for_kind(EUREKA_PROJECT_KIND),
        app_config: app_config,
        template_library: templates
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
        code_source_root: File.join(SiteKit::Core::Helpers.repo_root, 'sources', 'templates'),
        language_catalog: eureka_data.fetch('template_languages', {})
      )
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
  end
end
