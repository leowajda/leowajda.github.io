# frozen_string_literal: true

module SiteKit
  class EurekaTopicRegistry
    def initialize(project_slug:, templates:, flowchart_titles:, problem_records:)
      @project_slug = project_slug
      @templates = templates
      @flowchart_titles = flowchart_titles
      @problem_records = problem_records
    end

    def record
      topic_index = EurekaTopicIndexBuilder.new(
        templates: templates,
        flowchart_titles: flowchart_titles
      ).build
      problem_index = EurekaProblemTopicBuilder.new(
        problem_records: problem_records,
        topics: topic_index.topics,
        categories: topic_index.categories
      ).build

      {
        "project_slug" => project_slug,
        "topics" => problem_index.topics,
        "categories" => topic_index.categories,
        "flowchart_nodes" => topic_index.flowchart_nodes,
        "problems" => problem_index.problems,
        "templates" => topic_index.templates
      }
    end

    private

    attr_reader :project_slug, :templates, :flowchart_titles, :problem_records
  end
end
