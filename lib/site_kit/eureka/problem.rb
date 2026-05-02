# frozen_string_literal: true

module SiteKit
  module Eureka
    Problem = Data.define(
      :slug,
      :title,
      :problem_source_url,
      :difficulty,
      :categories,
      :implementations,
      :route_base,
      :app_config
    ) do
      def difficulty_slug
        SiteKit::Core::Helpers.slugify(difficulty)
      end

      def url
        "#{route_base}/problems/#{slug}/"
      end

      def implementation_entries
        implementations.map(&:to_summary_hash)
      end

      def language_records
        implementations
          .group_by(&:language)
          .values
          .map do |entries|
            first = entries.first
            {
              'slug' => first.language,
              'label' => first.language_label,
              'count' => entries.size
            }
          end
      end

      def summary_hash
        implementation_entries = self.implementation_entries

        {
          'problem_slug' => slug,
          'title' => title,
          'url' => url,
          'problem_source_url' => problem_source_url,
          'difficulty' => difficulty,
          'difficulty_slug' => difficulty_slug,
          'categories' => categories,
          'languages' => language_records,
          'implementations' => implementation_entries,
          'implementations_by_language' => implementations_by_language(implementation_entries),
          'code_collection' => code_collection(implementation_entries),
          'implementation_count' => implementations.size
        }
      end

      def implementations_by_language(implementation_entries)
        implementation_entries.group_by { |entry| entry.fetch('language') }
      end

      def code_collection(implementation_entries)
        SiteKit::Templates::CodeCollections::Model.build(
          entries: implementation_entries,
          default_entry_id: implementation_entries.first&.fetch('entry_id'),
          options: SiteKit::Templates::CodeCollections::Options.build(
            toolbar_aria: app_config.eureka.browser.toolbar_label,
            variant_catalog: app_config.code_collection.implementation_modes,
            variant_group_label: app_config.eureka.browser.variant_group_label,
            variant_group_visibility: app_config.eureka.browser.variant_group_visibility,
            variant_presentation: app_config.eureka.browser.variant_presentation,
            variant_icon_map: app_config.code_collection.variant_icons,
            sync_hash: true,
            problem_source_url: problem_source_url
          )
        )
      end
    end
  end
end
