# frozen_string_literal: true

module SiteKit
  class EurekaBrowserRecordBuilder
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
        'filters' => EurekaFilterBuilder.new(
          problem_records: problem_records,
          language_page_records: language_page_records
        ).build,
        'languages' => language_page_records,
        'problems' => problem_records
      }
    end

    private

    attr_reader :project_slug, :project_title, :project_description, :route_base, :language_page_records,
                :problem_records
  end
end
