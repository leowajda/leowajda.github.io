# frozen_string_literal: true

module SiteKit
  AlgorithmicTopic = Data.define(
    :id,
    :label,
    :kind,
    :order,
    :priority,
    :description,
    :template_id,
    :aliases,
    :problem_rules,
    :flowchart_nodes
  ) do
    def template?
      !template_id.empty?
    end
  end

  class AlgorithmicTopicRepository
    def initialize(topics:, flowchart_data:)
      @topics = topics
      @flowchart_data = flowchart_data
    end

    def load
      @load ||= begin
        topic_records = build_topics

        validate_unique_topic_ids!(topic_records)
        validate_unique_template_ids!(topic_records)
        validate_flowchart_nodes!(topic_records)

        topic_records.sort_by { |topic| [topic.priority, topic.order, topic.label.downcase] }
      end
    end

    private

    attr_reader :topics, :flowchart_data

    def build_topics
      Helpers.ensure_array(topics, 'Algorithmic topics').map.with_index do |entry, index|
        topic = Helpers.ensure_hash(entry, "Algorithmic topics[#{index}]")
        topic_id = Helpers.ensure_string(topic['id'], 'Algorithmic topic.id')

        aliases = ProblemRules.normalize_labels(topic['aliases'] || [], "Algorithmic topic #{topic_id}.aliases")
        flowchart_nodes = ProblemRules.normalize_labels(topic['flowchart_nodes'] || [],
                                                        "Algorithmic topic #{topic_id}.flowchart_nodes")
        template_id = topic.fetch('template', '').to_s
        order = Helpers.ensure_integer(topic['order'], "Algorithmic topic #{topic_id}.order")
        priority = Helpers.ensure_integer_or_nil(topic['priority'], "Algorithmic topic #{topic_id}.priority") ||
                   order

        if template_id.empty? && flowchart_nodes.any?
          raise "Algorithmic topic '#{topic_id}' maps flowchart nodes but has no template"
        end

        AlgorithmicTopic.new(
          id: topic_id,
          label: Helpers.ensure_string(topic['label'], "Algorithmic topic #{topic_id}.label"),
          kind: Helpers.ensure_string(topic['kind'], "Algorithmic topic #{topic_id}.kind"),
          order: order,
          priority: priority,
          description: Helpers.ensure_string(topic['description'], "Algorithmic topic #{topic_id}.description"),
          template_id: template_id,
          aliases: aliases,
          problem_rules: ProblemRules.normalize_with_default(topic.fetch('problem_rules', nil), aliases,
                                                             "Algorithmic topic #{topic_id}.problem_rules"),
          flowchart_nodes: flowchart_nodes
        )
      end
    end

    def validate_unique_topic_ids!(topic_records)
      Helpers.ensure_unique!(topic_records.map(&:id), 'Algorithmic topic ids must be unique')
    end

    def validate_unique_template_ids!(topic_records)
      template_ids = topic_records.filter_map do |topic|
        topic.template_id unless topic.template_id.empty?
      end

      Helpers.ensure_unique!(template_ids, 'Algorithmic topic template ids must be unique')
    end

    def validate_flowchart_nodes!(topic_records)
      unknown_node_ids = topic_records.flat_map(&:flowchart_nodes).uniq - flowchart_node_ids
      unless unknown_node_ids.empty?
        raise "Algorithmic topics reference unknown flowchart nodes: #{unknown_node_ids.join(', ')}"
      end

      uncovered_solution_ids = solution_node_ids - topic_records.select(&:template?).flat_map(&:flowchart_nodes).uniq
      return if uncovered_solution_ids.empty?

      raise "Algorithmic topics must cover every flowchart solution node: #{uncovered_solution_ids.join(', ')}"
    end

    def flowchart_node_ids
      @flowchart_node_ids ||= flowchart_nodes.map { |node| Helpers.ensure_string(node['id'], 'Flowchart node.id') }
    end

    def solution_node_ids
      @solution_node_ids ||= flowchart_nodes.filter_map do |node|
        node_id = Helpers.ensure_string(node['id'], 'Flowchart node.id')
        node_id if node['kind'] == 'solution'
      end
    end

    def flowchart_nodes
      @flowchart_nodes ||= Helpers.ensure_array(flowchart_data.fetch('nodes'), 'Flowchart data.nodes').map do |entry|
        Helpers.ensure_hash(entry, 'Flowchart node')
      end
    end
  end
end
