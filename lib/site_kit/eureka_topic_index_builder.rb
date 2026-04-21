# frozen_string_literal: true

module SiteKit
  EurekaTopicIndex = Data.define(:topics, :categories, :flowchart_nodes, :templates)

  class EurekaTopicIndexBuilder
    def initialize(templates:, flowchart_titles:)
      @templates = templates
      @flowchart_titles = flowchart_titles
    end

    def build
      topics = {}
      categories = {}
      flowchart_nodes = {}

      templates.each do |template|
        topic = topic_record(template)
        topics[template.template_id] = topic

        template.eureka_categories.each do |category|
          add_topic_reference(categories, category, template.template_id)
        end

        template.flowchart_nodes.each do |node_id|
          add_topic_reference(flowchart_nodes, node_id, template.template_id)
        end
      end

      EurekaTopicIndex.new(
        topics: topics,
        categories: finalize_index(categories, topics),
        flowchart_nodes: finalize_index(flowchart_nodes, topics),
        templates: topics.transform_values { |topic| compact_topic_reference(topic) }
      )
    end

    private

    attr_reader :templates, :flowchart_titles

    def topic_record(template)
      {
        "id" => template.template_id,
        "label" => template.title,
        "description" => template.description,
        "template_id" => template.template_id,
        "group_id" => template.group_id,
        "group_title" => template.group_title,
        "category_labels" => template.eureka_categories,
        "flowchart_nodes" => template.flowchart_nodes.map do |node_id|
          { "id" => node_id, "title" => flowchart_titles.fetch(node_id, node_id) }
        end
      }
    end

    def add_topic_reference(index, key, topic_id)
      index[key] ||= []
      index[key] |= [topic_id]
    end

    def finalize_index(index, topics)
      index.transform_values do |topic_ids|
        {
          "topic_ids" => topic_ids,
          "topics" => topic_ids.map { |topic_id| compact_topic_reference(topics.fetch(topic_id)) }
        }
      end
    end

    def compact_topic_reference(topic)
      {
        "id" => topic.fetch("id"),
        "label" => topic.fetch("label"),
        "description" => topic.fetch("description"),
        "group_id" => topic.fetch("group_id"),
        "group_title" => topic.fetch("group_title")
      }
    end
  end
end
