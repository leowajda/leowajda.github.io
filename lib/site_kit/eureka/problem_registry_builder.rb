# frozen_string_literal: true

module SiteKit
  module Eureka
    Catalog = Data.define(
      :language_page_records,
      :problem_records,
      :flowchart_titles
    )

    class ProblemRegistryBuilder
      def initialize(manifest:, app_config:, source_catalog:, source_root:)
        @manifest = manifest
        @app_config = app_config
        @source_catalog = source_catalog
        @source_root = source_root
        @route_base = manifest.route_base
        @languages_by_slug = SiteKit::Core::Helpers.index_by(source_catalog.languages, &:slug)
      end

      def build
        problems = source_catalog.problems.map do |problem_slug, entry|
          build_problem(problem_slug, SiteKit::Core::Helpers.ensure_hash(entry, "Problem '#{problem_slug}'"))
        end.sort_by { |problem| problem.fetch('title').downcase }

        Catalog.new(
          language_page_records: source_catalog.languages.map { |language| language.page_record(route_base) },
          problem_records: problems,
          flowchart_titles: source_catalog.flowchart_titles
        )
      end

      private

      attr_reader :manifest, :app_config, :source_catalog, :source_root, :route_base, :languages_by_slug

      def build_problem(problem_slug, raw)
        validate_problem_keys!(raw, problem_slug)
        title = str(raw, 'name', problem_slug)
        source_url = str(raw, 'url', problem_slug)
        implementations = load_implementations(problem_slug, title, source_url, raw.fetch('implementations'))
        raise SiteKit::CatalogError, "Problem '#{problem_slug}' has no implementations" if implementations.empty?

        paths = SiteKit::Core::ResourcePaths.new(route_base: route_base)
        {
          'problem_slug' => problem_slug,
          'title' => title,
          'url' => paths.item('problems', problem_slug),
          'embed_url' => paths.embed('problems', problem_slug),
          'problem_source_url' => source_url,
          'difficulty' => str(raw, 'difficulty', problem_slug),
          'difficulty_slug' => SiteKit::Core::Helpers.slugify(str(raw, 'difficulty', problem_slug)),
          'categories' => SiteKit::Core::Helpers.ensure_array_of_strings(
            raw.fetch('categories'),
            "Problem '#{problem_slug}'.categories"
          ),
          'languages' => language_records(implementations),
          'implementations' => implementations,
          'implementation_count' => implementations.size
        }
      end

      def language_records(implementations)
        implementations.group_by { |entry| entry.fetch('language') }.values.map do |entries|
          first = entries.first
          { 'slug' => first.fetch('language'), 'label' => first.fetch('language_label'), 'count' => entries.size }
        end
      end

      def load_implementations(problem_slug, title, source_url, raw_list)
        entries = SiteKit::Core::Helpers.ensure_array(raw_list, "Problem '#{problem_slug}'.implementations")
        implementations = entries.map.with_index do |raw, index|
          build_implementation(problem_slug, title, source_url, raw, index)
        end
        SiteKit::Core::Helpers.ensure_unique!(
          implementations.map { |entry| entry.fetch('entry_id') },
          "Problem '#{problem_slug}' implementation ids must be unique"
        )
        implementations
      end

      def build_implementation(problem_slug, title, source_url, raw, index) # rubocop:disable Metrics/AbcSize,Metrics/MethodLength
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
        approach = SiteKit::Core::Helpers.ensure_string(
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

        entry_id = SiteKit::Core::Helpers.slugify("#{language.slug}-#{approach}")
        paths = SiteKit::Core::ResourcePaths.new(route_base: route_base)
        problem_url = paths.item('problems', problem_slug)
        approach_label = SiteKit::Core::Helpers.human_label(approach)

        {
          'problem_slug' => problem_slug,
          'problem_title' => title,
          'problem_source_url' => source_url,
          'implementation_id' => entry_id,
          'entry_id' => entry_id,
          'language' => language.slug,
          'language_label' => language.label,
          'approach' => approach,
          'approach_label' => approach_label,
          'variant' => approach,
          'variant_label' => approach_label,
          'title' => "#{title} · #{language.label} #{approach_label}",
          'description' => "#{title} solution in #{language.label} using the #{approach_label.downcase} approach.",
          'source_url' => "#{source_catalog.source_url_base}/#{file_path}",
          'code' => code,
          'code_language' => language.code_language,
          'detail_url' => paths.with_fragment(problem_url, entry_id),
          'embed_url' => paths.with_fragment(paths.embed('problems', problem_slug), entry_id)
        }
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
  end
end
