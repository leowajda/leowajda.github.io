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
        flowchart_data: flowchart_data
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
        language_catalog: eureka_data.fetch('template_languages', {})
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
      guide = templates.guide
      eureka.browsers
      eureka.topics
      validate_template_reference_rules!(guide)
      validate_problem_template_keys!
      source_notes.registries
      nil
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
      eureka.browsers.each_value do |browser|
        if browser.fetch('filters').key?('patterns')
          raise SiteKit::InvariantError, 'Problem explorer filters must not include template patterns'
        end

        browser.fetch('problems').each do |problem|
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
