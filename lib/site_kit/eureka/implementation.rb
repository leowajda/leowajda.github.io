# frozen_string_literal: true

module SiteKit
  module Eureka
    Implementation = Data.define(
      :problem_slug,
      :problem_title,
      :problem_source_url,
      :language,
      :approach,
      :source_url,
      :code,
      :code_language,
      :route_base,
      :language_label
    ) do
      def paths
        SiteKit::Core::ResourcePaths.new(route_base: route_base)
      end

      def implementation_id
        SiteKit::Core::Helpers.slugify("#{language}-#{approach}")
      end

      def approach_label
        SiteKit::Core::Helpers.human_label(approach)
      end

      def title
        "#{problem_title} · #{language_label} #{approach_label}"
      end

      def description
        "#{problem_title} solution in #{language_label} using the #{approach_label.downcase} approach."
      end

      def problem_url
        paths.item('problems', problem_slug)
      end

      def detail_url
        paths.with_fragment(problem_url, implementation_id)
      end

      def embed_url
        paths.with_fragment(paths.embed('problems', problem_slug), implementation_id)
      end

      def to_summary_hash
        {
          'problem_slug' => problem_slug,
          'problem_title' => problem_title,
          'problem_source_url' => problem_source_url,
          'implementation_id' => implementation_id,
          'entry_id' => implementation_id,
          'language' => language,
          'language_label' => language_label,
          'approach' => approach,
          'approach_label' => approach_label,
          'variant' => approach,
          'variant_label' => approach_label,
          'title' => title,
          'description' => description,
          'source_url' => source_url,
          'code' => code,
          'code_language' => code_language,
          'detail_url' => detail_url,
          'embed_url' => embed_url
        }
      end
    end
  end
end
