# frozen_string_literal: true

module SiteKit
  EurekaProblemTopicIndex = Data.define(:topics, :problems)

  class EurekaProblemTopicBuilder
    def initialize(problem_records:, topics:, categories:)
      @problem_records = problem_records
      @topics = topics
      @categories = categories
    end

    def build
      problem_titles = problem_records.to_h do |problem|
        [problem.fetch("problem_slug"), problem.fetch("title")]
      end
      topic_problem_slugs = topics.transform_values { [] }

      problems = problem_records.to_h do |problem|
        topic_ids = problem.fetch("categories").flat_map do |category|
          categories.fetch(category, {}).fetch("topic_ids", [])
        end.uniq

        topic_ids.each { |topic_id| topic_problem_slugs.fetch(topic_id) << problem.fetch("problem_slug") }

        [
          problem.fetch("problem_slug"),
          {
            "topic_ids" => topic_ids,
            "topics" => topic_ids.map { |topic_id| compact_topic_reference(topics.fetch(topic_id)) },
            "categories" => problem.fetch("categories").map do |category|
              category_topics = categories.fetch(category, { "topic_ids" => [], "topics" => [] })
              {
                "label" => category,
                "topic_ids" => category_topics.fetch("topic_ids"),
                "topics" => category_topics.fetch("topics"),
                "primary_topic_id" => category_topics.fetch("topic_ids").size == 1 ? category_topics.fetch("topic_ids").first : ""
              }
            end
          }
        ]
      end

      EurekaProblemTopicIndex.new(
        topics: topics.transform_values do |topic|
          problem_slugs = topic_problem_slugs.fetch(topic.fetch("id"))
          topic.merge(
            "problems" => problem_slugs.map do |problem_slug|
              { "slug" => problem_slug, "title" => problem_titles.fetch(problem_slug, problem_slug) }
            end
          )
        end,
        problems: problems
      )
    end

    private

    attr_reader :problem_records, :topics, :categories

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
