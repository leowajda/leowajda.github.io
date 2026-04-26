# frozen_string_literal: true

module SiteKit
  EurekaTopicIndex = Data.define(:topics, :categories, :flowchart_nodes, :templates)

  class EurekaTopicIndexBuilder
    def initialize(topics:, templates:, flowchart_titles:)
      @topics = topics
      @templates = templates
      @flowchart_titles = flowchart_titles
    end

    def build
      topic_records = {}
      categories = {}
      flowchart_nodes = {}
      template_index = templates.to_h { |template| [template.template_id, template] }

      topics.each do |topic|
        topic_records[topic.id] = topic_record(topic)
        category_labels(topic).each { |category| add_topic_reference(categories, category, topic.id) }

        next unless topic.template?

        template_index.fetch(topic.template_id) do
          raise "Algorithmic topic '#{topic.id}' references missing template '#{topic.template_id}'"
        end
        topic.flowchart_nodes.each { |node_id| add_topic_reference(flowchart_nodes, node_id, topic.id) }
      end

      EurekaTopicIndex.new(
        topics: topic_records,
        categories: finalize_category_index(categories, topic_records),
        flowchart_nodes: finalize_flowchart_index(flowchart_nodes, topic_records),
        templates: template_records(topic_records)
      )
    end

    private

    attr_reader :topics, :templates, :flowchart_titles

    def topic_presenter
      @topic_presenter ||= AlgorithmicTopicPresenter.new
    end

    def topic_record(topic)
      {
        'id' => topic.id,
        'label' => topic.label,
        'description' => topic.description,
        'template_id' => topic.template_id,
        'kind' => topic.kind,
        'order' => topic.order,
        'priority' => topic.priority,
        'category_labels' => category_labels(topic),
        'problem_rules' => topic.problem_rules,
        'flowchart_nodes' => topic.flowchart_nodes.map do |node_id|
          { 'id' => node_id, 'title' => flowchart_titles.fetch(node_id, node_id) }
        end
      }
    end

    def category_labels(topic)
      @category_labels ||= {}
      @category_labels[topic.id] ||= begin
        rule_labels = topic.problem_rules.flat_map do |rule|
          rule.fetch('all', []) + rule.fetch('any', [])
        end
        (topic.aliases + rule_labels).uniq
      end
    end

    def add_topic_reference(index, key, topic_id)
      index[key] ||= []
      index[key] |= [topic_id]
    end

    def finalize_category_index(index, topics)
      index.transform_values do |topic_ids|
        sorted_topic_ids = sort_topic_ids(topic_ids, topics)
        {
          'topic_ids' => sorted_topic_ids,
          'topics' => sorted_topic_ids.map { |topic_id| topic_presenter.topic_reference(topics.fetch(topic_id)) },
          'template_ids' => sorted_topic_ids.filter_map do |topic_id|
            topic_presenter.present_template_id(topics.fetch(topic_id))
          end
        }
      end
    end

    def finalize_flowchart_index(index, topics)
      index.transform_values do |topic_ids|
        sorted_topic_ids = sort_topic_ids(topic_ids, topics)
        {
          'topic_ids' => sorted_topic_ids,
          'topics' => sorted_topic_ids.filter_map do |topic_id|
            topic_presenter.template_reference(topics.fetch(topic_id))
          end,
          'template_ids' => sorted_topic_ids.filter_map do |topic_id|
            topic_presenter.present_template_id(topics.fetch(topic_id))
          end
        }
      end
    end

    def sort_topic_ids(topic_ids, topics)
      topic_ids.sort_by do |topic_id|
        topic = topics.fetch(topic_id)
        [topic.fetch('priority'), topic.fetch('order'), topic.fetch('label').downcase]
      end
    end

    def template_records(topics)
      topics
        .values
        .filter_map { |topic| topic_presenter.template_reference(topic) }
        .to_h { |topic| [topic.fetch('id'), topic] }
    end
  end
end
