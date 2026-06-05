# frozen_string_literal: true

module SiteKit
  module Eureka
    class BrowserRecordBuilder
      def initialize(project_slug:, project_title:, project_description:, route_base:, language_page_records:,
                     problem_records:)
        @project_slug = project_slug
        @project_title = project_title
        @project_description = project_description
        @route_base = route_base
        @language_page_records = language_page_records
        @problem_records = problem_records
      end

      def build
        {
          'project_slug' => project_slug,
          'project_title' => project_title,
          'project_description' => project_description,
          'browser_url' => "#{route_base}/problems/",
          'filters' => filters,
          'languages' => language_page_records,
          'problems' => problem_records
        }
      end

      private

      attr_reader :project_slug, :project_title, :project_description, :route_base, :language_page_records,
                  :problem_records

      def filters
        {
          'difficulties' => problem_records.map { |problem| problem.fetch('difficulty') }.uniq,
          'categories' => problem_records.flat_map { |problem| problem.fetch('categories') }.uniq,
          'languages' => language_page_records.map { |language| language.slice('slug', 'label', 'url') }
        }
      end
    end
  end
end
