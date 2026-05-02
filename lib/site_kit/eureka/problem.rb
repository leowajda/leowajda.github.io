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
      :route_base
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
          'implementation_count' => implementations.size
        }
      end
    end
  end
end
