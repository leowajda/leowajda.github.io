# frozen_string_literal: true

module SiteKit
  class AlgorithmicTopicPresenter
    TOPIC_REFERENCE_KEYS = %w[id label description template_id kind order priority].freeze

    def topic_reference(topic)
      TOPIC_REFERENCE_KEYS.to_h do |key|
        [key, topic.fetch(key)]
      end
    end

    def template_reference(topic)
      topic_template_id = template_id(topic)
      return nil if topic_template_id.empty?

      topic_reference(topic).merge('id' => topic_template_id, 'topic_id' => topic.fetch('id'))
    end

    def template_id(topic)
      topic.fetch('template_id', '')
    end

    def present_template_id(topic)
      topic_template_id = template_id(topic)
      topic_template_id unless topic_template_id.empty?
    end

    def sort_key(topic)
      [topic.fetch('priority'), topic.fetch('order'), topic.fetch('label').downcase]
    end
  end
end
