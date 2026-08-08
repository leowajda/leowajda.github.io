# frozen_string_literal: true

require 'pathname'

# rubocop:disable Metrics/MethodLength, Metrics/AbcSize

module SiteKit
  module Eureka
    module Topics
      module_function

      def record(project_slug:, topics:, templates:, template_guide:, problem_records:)
        _ = project_slug
        validate_templates!(topics, templates)
        categories = category_index(topics)
        validate_problem_categories!(problem_records, categories)

        resolver = SiteKit::Templates::ReferenceResolver.new(guide: template_guide)
        problems = problem_records.to_h do |problem|
          labels = problem.fetch('categories')
          [
            problem.fetch('problem_slug'),
            { 'template_references' => resolver.references_for_categories(labels) }
          ]
        end

        {
          'categories' => categories,
          'problems' => problems
        }
      end

      def validate_templates!(topics, templates)
        template_ids = templates.to_h { |template| [template.template_id, true] }
        topics.each do |topic|
          next unless topic.template?

          next if template_ids.key?(topic.template_id)

          raise SiteKit::CatalogError,
                "Algorithmic topic '#{topic.id}' references missing template '#{topic.template_id}'"
        end
      end

      def category_index(topics)
        index = {}
        topics.each do |topic|
          category_labels(topic).each do |label|
            index[label] ||= { 'topic_ids' => [] }
            index[label]['topic_ids'] |= [topic.id]
          end
        end
        index
      end

      def category_labels(topic)
        rule_labels = topic.problem_rules.flat_map { |rule| rule.fetch('all', []) + rule.fetch('any', []) }
        (topic.aliases + rule_labels).uniq
      end

      def validate_problem_categories!(problem_records, categories)
        unknown = problem_records.flat_map { |problem| problem.fetch('categories') }.uniq - categories.keys
        return if unknown.empty?

        raise SiteKit::CatalogError,
              "Eureka problem categories are not mapped to local topics: #{unknown.sort.join(', ')}"
      end
    end

    Language = Data.define(:slug, :label, :code_language) do
      def page_record(_route_base = nil)
        {
          'slug' => slug,
          'label' => label,
          'title' => "#{label} Solutions",
          'description' => "All LeetCode solutions in #{label}."
        }
      end
    end

    SourceCatalog = Data.define(:source_url_base, :languages, :problems)

    class SourceCatalogLoader
      def initialize(manifest:, app_config:)
        @manifest = manifest
        @app_config = app_config
        @source_root = Pathname(manifest.source_root(SiteKit::Core::Helpers.repo_root))
      end

      def load
        source = raw_catalog

        SiteKit::Eureka::SourceCatalog.new(
          source_url_base: SiteKit::Core::Helpers.ensure_string(source.fetch('source_url_base'),
                                                                'Eureka source.source_url_base'),
          languages: parse_languages(source.fetch('languages')),
          problems: SiteKit::Core::Helpers.ensure_hash(source.fetch('problems'), 'Eureka source.problems')
        )
      end

      private

      attr_reader :manifest, :app_config, :source_root

      def raw_catalog
        @raw_catalog ||= begin
          raw = SiteKit::Core::Helpers.read_text(source_root.join('data', 'problems.yml'))
          source = SiteKit::Core::Helpers.ensure_hash(
            SiteKit::Core::Helpers.parse_yaml(raw, 'Unable to decode Eureka problem table'), 'Eureka source'
          )
          version = source['version']
          expected_version = app_config.eureka.fetch('catalog_version')
          unless version == expected_version
            raise SiteKit::CatalogError, "Eureka source.version must be #{expected_version}"
          end

          source
        end
      end

      def parse_languages(value)
        SiteKit::Core::Helpers.ensure_hash(value, 'Eureka source.languages').map do |language_slug, entry|
          record = SiteKit::Core::Helpers.ensure_hash(entry, "Eureka source.languages.#{language_slug}")

          SiteKit::Eureka::Language.new(
            slug: language_slug,
            label: SiteKit::Core::Helpers.ensure_string(record.fetch('label'),
                                                        "Eureka source.languages.#{language_slug}.label"),
            code_language: SiteKit::Core::Helpers.ensure_string(
              record.fetch('code_language'),
              "Eureka source.languages.#{language_slug}.code_language"
            )
          )
        end
      end
    end

    Catalog = Data.define(
      :language_page_records,
      :problem_records
    )

    class ProblemRegistryBuilder
      def initialize(manifest:, app_config:, source_catalog:, source_root:)
        @manifest = manifest
        @app_config = app_config
        @source_catalog = source_catalog
        @source_root = source_root
        @route_base = manifest.route_base
        @paths = SiteKit::Core::ResourcePaths.new(route_base: route_base)
        @languages_by_slug = SiteKit::Core::Helpers.index_by(source_catalog.languages, &:slug)
      end

      def build
        problems = source_catalog.problems.map do |problem_slug, entry|
          build_problem(problem_slug, SiteKit::Core::Helpers.ensure_hash(entry, "Problem '#{problem_slug}'"))
        end.sort_by { |problem| problem.fetch('title').downcase }

        Catalog.new(
          language_page_records: source_catalog.languages.map { |language| language.page_record(route_base) },
          problem_records: problems
        )
      end

      private

      attr_reader :manifest, :app_config, :source_catalog, :source_root, :route_base, :paths, :languages_by_slug

      def build_problem(problem_slug, raw)
        validate_problem_keys!(raw, problem_slug)
        title = str(raw, 'name', problem_slug)
        source_url = str(raw, 'url', problem_slug)
        entries = load_entries(problem_slug, title, source_url, raw.fetch('implementations'))
        raise SiteKit::CatalogError, "Problem '#{problem_slug}' has no entries" if entries.empty?

        {
          'problem_slug' => problem_slug,
          'title' => title,
          'url' => paths.path('problems', problem_slug),
          'embed_url' => paths.embed('problems', problem_slug),
          'problem_source_url' => source_url,
          'difficulty' => str(raw, 'difficulty', problem_slug),
          'difficulty_slug' => SiteKit::Core::Helpers.slugify(str(raw, 'difficulty', problem_slug)),
          'categories' => SiteKit::Core::Helpers.ensure_array_of_strings(
            raw.fetch('categories'),
            "Problem '#{problem_slug}'.categories"
          ),
          'languages' => language_records(entries),
          'entries' => entries,
          'entry_count' => entries.size
        }
      end

      def language_records(entries)
        entries.group_by { |entry| entry.fetch('language') }.values.map do |group|
          first = group.first
          { 'slug' => first.fetch('language'), 'label' => first.fetch('language_label'), 'count' => group.size }
        end
      end

      def load_entries(problem_slug, title, source_url, raw_list)
        list = SiteKit::Core::Helpers.ensure_array(raw_list, "Problem '#{problem_slug}'.implementations")
        entries = list.map.with_index do |raw, index|
          build_entry(problem_slug, title, source_url, raw, index)
        end
        SiteKit::Core::Helpers.ensure_unique!(
          entries.map { |entry| entry.fetch('entry_id') },
          "Problem '#{problem_slug}' entry ids must be unique"
        )
        entries
      end

      def build_entry(problem_slug, title, source_url, raw, index) # rubocop:disable Metrics/AbcSize,Metrics/MethodLength
        raw = SiteKit::Core::Helpers.ensure_hash(raw, "Problem '#{problem_slug}'.implementations[#{index}]")
        unknown = raw.keys - app_config.eureka.fetch('implementation_keys')
        unless unknown.empty?
          raise SiteKit::CatalogError,
                "Problem '#{problem_slug}' implementation #{index} references unsupported keys: #{unknown.join(', ')}"
        end

        language_slug = SiteKit::Core::Helpers.ensure_string(
          raw.fetch('language'),
          "Problem '#{problem_slug}'.implementations[#{index}].language"
        )
        language = languages_by_slug.fetch(language_slug) do
          raise SiteKit::CatalogError,
                "Problem '#{problem_slug}' implementation #{index} references unknown language '#{language_slug}'"
        end
        variant = SiteKit::Core::Helpers.ensure_string(
          raw.fetch('approach'),
          "Problem '#{problem_slug}'.implementations[#{index}].approach"
        )
        file_path = SiteKit::Core::Helpers.ensure_string(
          raw.fetch('file_path'),
          "Problem '#{problem_slug}'.implementations[#{index}].file_path"
        )
        code_path = SiteKit::Core::Helpers.confined_path(
          source_root, file_path,
          context: "Problem '#{problem_slug}' implementation #{index} file_path",
          error_class: SiteKit::CatalogError
        )
        raise SiteKit::CatalogError, "Eureka implementation source is missing: '#{code_path}'" unless code_path.exist?

        code = SiteKit::Core::Helpers.read_text(code_path)
        raise SiteKit::CatalogError, "Eureka implementation source is empty: '#{code_path}'" if code.strip.empty?

        entry_id = SiteKit::Core::Helpers.slugify("#{language.slug}-#{variant}")
        variant_label = SiteKit::Core::Helpers.human_label(variant)
        detail_url = paths.with_fragment(paths.path('problems', problem_slug), entry_id)
        embed_url = paths.embed('problems', problem_slug)

        SiteKit::Core::CodeEntry.normalize(
          {
            'entry_id' => entry_id,
            'language' => language.slug,
            'language_label' => language.label,
            'variant' => variant,
            'variant_label' => variant_label,
            'code' => code,
            'code_language' => language.code_language,
            'source_url' => "#{source_catalog.source_url_base}/#{file_path}",
            'detail_url' => detail_url,
            'embed_url' => embed_url
          },
          context: "Problem '#{problem_slug}' entry #{entry_id}"
        ).merge(
          'problem_slug' => problem_slug,
          'problem_title' => title,
          'problem_source_url' => source_url,
          'title' => "#{title} · #{language.label} #{variant_label}",
          'description' => "#{title} solution in #{language.label} using the #{variant_label.downcase} approach."
        )
      end

      def validate_problem_keys!(raw, problem_slug)
        unknown = raw.keys - (app_config.eureka.fetch('metadata_keys') + ['implementations'])
        return if unknown.empty?

        raise SiteKit::CatalogError, "Problem '#{problem_slug}' references unsupported keys: #{unknown.join(', ')}"
      end

      def str(raw, key, problem_slug)
        SiteKit::Core::Helpers.ensure_string(raw.fetch(key), "Problem '#{problem_slug}'.#{key}")
      end
    end

    class Project
      def initialize(manifest:, app_config:, template_library:)
        @manifest = manifest
        @app_config = app_config
        @template_library = template_library
        @paths = SiteKit::Core::ResourcePaths.new(route_base: manifest.route_base)
      end

      def slug
        manifest.slug
      end

      def explorer
        @explorer ||= begin
          languages = catalog.language_page_records.map { |language| language.slice('slug', 'label') }
          {
            'project_slug' => slug,
            'project_title' => manifest.title,
            'project_description' => manifest.description,
            'browser_url' => paths.path('problems'),
            'filters' => {
              'difficulties' => problem_records.map { |problem| problem.fetch('difficulty') }.uniq,
              'categories' => problem_records.flat_map { |problem| problem.fetch('categories') }.uniq,
              'languages' => languages
            },
            'languages' => languages,
            'problems' => problem_records
          }
        end
      end

      def topics_record
        @topics_record ||= SiteKit::Eureka::Topics.record(
          project_slug: slug,
          topics: template_library.topics,
          templates: template_library.templates,
          template_guide: template_library.guide,
          problem_records: catalog.problem_records
        )
      end

      def generated_pages
        explorer.fetch('problems').flat_map { |problem| [problem_page(problem), embed_page(problem)] }
      end

      private

      attr_reader :manifest, :app_config, :template_library, :paths

      def problem_records
        @problem_records ||= catalog.problem_records.map do |problem|
          refs = topics_record.fetch('problems').fetch(problem.fetch('problem_slug')).fetch('template_references', [])
          problem.merge(
            'template_references' => refs.map do |reference|
              target = reference.fetch('target', '')
              reference.merge('url' => target.empty? ? '' : "#{SiteKit::TEMPLATES_URL}##{target}")
            end
          )
        end
      end

      def catalog
        @catalog ||= begin
          source_root = Pathname(manifest.source_root(SiteKit::Core::Helpers.repo_root))
          source_catalog = SourceCatalogLoader.new(manifest: manifest, app_config: app_config).load
          ProblemRegistryBuilder.new(
            manifest: manifest,
            app_config: app_config,
            source_catalog: source_catalog,
            source_root: source_root
          ).build
        end
      end

      def problem_page(problem)
        slug = problem.fetch('problem_slug')
        SiteKit::Emit.page(
          dir: paths.path('problems', slug),
          page_type: EUREKA_PROBLEM_PAGE_TYPE,
          project_slug: self.slug,
          title: problem.fetch('title'),
          description: "#{problem.fetch('title')} solutions",
          data: problem_page_data(problem).merge('entries' => problem.fetch('entries'))
        )
      end

      def embed_page(problem)
        slug = problem.fetch('problem_slug')
        SiteKit::Emit.page(
          dir: paths.embed('problems', slug),
          page_type: EUREKA_EMBED_PAGE_TYPE,
          project_slug: self.slug,
          title: "#{problem.fetch('title')} · Embed",
          description: "#{problem.fetch('title')} solutions embed",
          data: problem_page_data(problem).merge(
            'entries' => problem.fetch('entries'),
            'detail_url' => problem.fetch('url'),
            'embed' => true
          )
        )
      end

      def problem_page_data(problem)
        source = problem.fetch('problem_source_url')
        {
          'problem_slug' => problem.fetch('problem_slug'),
          'problem_record' => problem,
          'problem_source_url' => source,
          'nav_external_url' => source,
          'nav_external_icon' => 'leetcode',
          'nav_external_label' => 'Open LeetCode problem'
        }
      end
    end

    class Context
      def initialize(manifests:, app_config:, template_library:)
        @manifests = manifests
        @app_config = app_config
        @template_library = template_library
      end

      def explorers
        @explorers ||= projects.transform_values(&:explorer)
      end

      def topics
        @topics ||= projects.transform_values(&:topics_record)
      end

      def generated_pages
        @generated_pages ||= projects.values.flat_map(&:generated_pages)
      end

      private

      attr_reader :manifests, :app_config, :template_library

      def projects
        @projects ||= manifests.to_h do |manifest|
          [
            manifest.slug,
            Project.new(manifest: manifest, app_config: app_config, template_library: template_library)
          ]
        end
      end
    end
  end
end

# rubocop:enable Metrics/MethodLength, Metrics/AbcSize
