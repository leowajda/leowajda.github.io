# frozen_string_literal: true

module SiteKit
  class Build
    CACHE_KEY = '__site_kit_build'

    def self.for(site)
      site.config[CACHE_KEY] ||= new(site)
    end

    def self.clear(site)
      site.config.delete(CACHE_KEY)
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

    alias generated_pages pages

    def search_extras
      @search_extras ||= SiteKit::Extras::Pagefind.records(template_guide: templates.guide)
    end

    alias search_records search_extras

    def attach!(site)
      documents = site.pages + site.collections.fetch('posts').docs
      documents.each { |document| attach_document(document) }
    end

    def attach_document(document)
      case document.data['layout']
      when 'home'
        document.data['home_projects'] = site_projects
      when 'problems'
        document.data['explorer'] = eureka.explorers.fetch(document.data.fetch('project_slug'))
      when 'template_library'
        guide = templates.guide
        document.data['template_guide'] = guide
        document.data['default_template_target'] = guide.fetch('default_target')
        slug = document.data.fetch('project_slug')
        document.data['project_title'] ||= eureka.explorers.fetch(slug).fetch('project_title')
      end
    end

    def validate!
      pages
      guide = templates.guide
      eureka.explorers
      eureka.topics
      validate_template_reference_rules!(guide)
      validate_problem_template_keys!
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

    def site_projects
      @site_projects ||= SiteKit::Catalogs::SiteProjectPresenter.new(
        manifests: project_registry.manifests,
        source_registries: source_notes.registries
      ).records
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

    def validate_template_reference_rules!(guide)
      known = eureka.topics.values.flat_map { |registry| registry.fetch('categories').keys }.uniq
      unknown = guide.fetch('reference_rules').flat_map do |rule|
        rule.fetch('problem_rule').values.flatten
      end.uniq - known
      return if unknown.empty?

      raise SiteKit::InvariantError,
            "Template guide reference rules use unknown problem categories: #{unknown.sort.join(', ')}"
    end

    def validate_problem_template_keys!
      eureka.explorers.each_value do |explorer|
        if explorer.fetch('filters').key?('patterns')
          raise SiteKit::InvariantError, 'Problem explorer filters must not include template patterns'
        end

        explorer.fetch('problems').each do |problem|
          DISALLOWED_PROBLEM_TEMPLATE_KEYS.each do |key|
            next unless problem.key?(key)

            raise SiteKit::InvariantError,
                  "Problem '#{problem.fetch('problem_slug')}' must not include #{key}"
          end

          problem.fetch('template_references').each do |reference|
            target = reference.fetch('target')
            url = reference.fetch('url', '')
            if url.empty?
              raise SiteKit::InvariantError,
                    "Problem '#{problem.fetch('problem_slug')}' template reference '#{target}' is missing a URL"
            end
          end
        end
      end
    end
  end
end
