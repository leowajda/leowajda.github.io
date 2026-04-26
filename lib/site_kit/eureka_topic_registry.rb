# frozen_string_literal: true

module SiteKit
  class EurekaTopicRegistry
    def initialize(project_slug:, topics:, templates:, template_guide:, flowchart_titles:, problem_records:)
      @project_slug = project_slug
      @topics = topics
      @templates = templates
      @template_guide = template_guide
      @flowchart_titles = flowchart_titles
      @problem_records = problem_records
    end

    def record
      topic_index = EurekaTopicIndexBuilder.new(
        topics: topics,
        templates: templates,
        flowchart_titles: flowchart_titles
      ).build
      problem_index = EurekaProblemTopicBuilder.new(
        problem_records: problem_records,
        topics: topic_index.topics,
        categories: topic_index.categories,
        template_guide: template_guide
      ).build

      {
        'project_slug' => project_slug,
        'topics' => problem_index.topics,
        'categories' => topic_index.categories,
        'flowchart_nodes' => template_guide.fetch('flowchart_nodes'),
        'problems' => problem_index.problems,
        'templates' => topic_index.templates
      }
    end

    private

    attr_reader :project_slug, :topics, :templates, :template_guide, :flowchart_titles, :problem_records
  end
end
