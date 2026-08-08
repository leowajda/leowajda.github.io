# frozen_string_literal: true

module SiteKit
  module Templates
    Topic = Data.define(
      :id,
      :label,
      :kind,
      :order,
      :priority,
      :description,
      :template_id,
      :aliases,
      :problem_rules
    ) do
      def template?
        !template_id.empty?
      end
    end

    class TopicRepository
      def initialize(topics:)
        @topics = topics
      end

      def load
        @load ||= begin
          topic_records = build_topics

          validate_unique_topic_ids!(topic_records)
          validate_unique_template_ids!(topic_records)

          topic_records.sort_by { |topic| [topic.priority, topic.order, topic.label.downcase] }
        end
      end

      private

      attr_reader :topics

      def build_topics
        SiteKit::Core::Helpers.ensure_array(topics, 'Algorithmic topics').map.with_index do |entry, index|
          topic = SiteKit::Core::Helpers.ensure_hash(entry, "Algorithmic topics[#{index}]")
          topic_id = SiteKit::Core::Helpers.ensure_string(topic['id'], 'Algorithmic topic.id')
          build_topic(topic, topic_id)
        end
      end

      def build_topic(topic, topic_id)
        aliases = SiteKit::Templates::ProblemRules.normalize_labels(topic['aliases'] || [],
                                                                    "Algorithmic topic #{topic_id}.aliases")
        template_id = topic.fetch('template', '').to_s
        order = SiteKit::Core::Helpers.ensure_integer(topic['order'], "Algorithmic topic #{topic_id}.order")
        priority = SiteKit::Core::Helpers.ensure_integer_or_nil(topic['priority'],
                                                                "Algorithmic topic #{topic_id}.priority") ||
                   order

        SiteKit::Templates::Topic.new(
          id: topic_id,
          label: SiteKit::Core::Helpers.ensure_string(topic['label'], "Algorithmic topic #{topic_id}.label"),
          kind: SiteKit::Core::Helpers.ensure_string(topic['kind'], "Algorithmic topic #{topic_id}.kind"),
          order: order,
          priority: priority,
          description: SiteKit::Core::Helpers.ensure_string(topic['description'],
                                                            "Algorithmic topic #{topic_id}.description"),
          template_id: template_id,
          aliases: aliases,
          problem_rules: SiteKit::Templates::ProblemRules.normalize_with_default(
            topic.fetch('problem_rules', nil),
            aliases,
            "Algorithmic topic #{topic_id}.problem_rules"
          )
        )
      end

      def validate_unique_topic_ids!(topic_records)
        SiteKit::Core::Helpers.ensure_unique!(topic_records.map(&:id), 'Algorithmic topic ids must be unique')
      end

      def validate_unique_template_ids!(topic_records)
        template_ids = topic_records.filter_map do |topic|
          topic.template_id unless topic.template_id.empty?
        end

        SiteKit::Core::Helpers.ensure_unique!(template_ids, 'Algorithmic topic template ids must be unique')
      end
    end
  end
end
