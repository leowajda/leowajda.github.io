# frozen_string_literal: true

module SiteKit
  module Eureka
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
  end
end
