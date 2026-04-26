# frozen_string_literal: true

module SiteKit
  AlgorithmicTemplate = Data.define(
    :template_id,
    :topic_id,
    :title,
    :kind,
    :order,
    :description,
    :aliases,
    :problem_rules,
    :flowchart_nodes
  )

  class AlgorithmicTemplateRepository
    def initialize(topics:)
      @topics = topics
    end

    def load
      @load ||= begin
        templates = topics.select(&:template?).map { |topic| build_template(topic) }

        validate_unique_template_ids!(templates)
        templates.sort_by { |template| [template.order, template.title.downcase] }
      end
    end

    private

    attr_reader :topics

    def build_template(topic)
      AlgorithmicTemplate.new(
        template_id: topic.template_id,
        topic_id: topic.id,
        title: topic.label,
        kind: topic.kind,
        order: topic.order,
        description: topic.description,
        aliases: topic.aliases,
        problem_rules: topic.problem_rules,
        flowchart_nodes: topic.flowchart_nodes
      )
    end

    def validate_unique_template_ids!(templates)
      Helpers.ensure_unique!(templates.map(&:template_id), 'Algorithmic template ids must be unique')
    end
  end
end
