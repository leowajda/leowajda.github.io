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

    def explorer(project_slug)
      eureka.explorers.fetch(project_slug)
    end

    def guide
      templates.guide
    end

    def home_projects
      @home_projects ||= manifests.sort_by { |manifest| manifest.fetch('homepage_order') }.map do |manifest|
        {
          'slug' => manifest.fetch('slug'),
          'kind' => manifest.fetch('kind'),
          'title' => manifest.fetch('title'),
          'description' => manifest.fetch('description'),
          'source_url' => manifest.fetch('source_url'),
          'homepage_order' => manifest.fetch('homepage_order'),
          'home_url' => manifest.fetch('entry_url'),
          'home_groups' => homepage_groups(manifest)
        }
      end
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
      site.data.fetch('site').fetch('app')
    end

    def eureka
      @eureka ||= SiteKit::Eureka::Context.new(
        manifests: manifests_for(EUREKA_PROJECT_KIND),
        app_config: app_config,
        template_library: templates
      )
    end

    def source_notes
      @source_notes ||= SiteKit::SourceNotes::Context.new(
        manifests: manifests_for(SOURCE_NOTES_PROJECT_KIND),
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

    def manifests
      @manifests ||= SiteKit::Projects.load(site.data['projects'], SiteKit::Core::Helpers.repo_root)
    end

    def manifests_for(kind)
      manifests.select { |manifest| manifest.fetch('kind') == kind }
    end

    def homepage_groups(manifest)
      return [] unless manifest.fetch('kind') == SOURCE_NOTES_PROJECT_KIND

      registry = source_notes.registries[manifest.fetch('slug')]
      return [] unless registry

      registry.fetch('languages', []).map do |language|
        {
          'language_title' => language.fetch('language_title'),
          'modules' => language.fetch('modules').map do |module_record|
            { 'title' => module_record.fetch('title'), 'url' => module_record.fetch('url') }
          end
        }
      end
    end

    def eureka_data
      @eureka_data ||= site.data.fetch(EUREKA_NAMESPACE, {})
    end
  end
end
