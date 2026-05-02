# frozen_string_literal: true

module SiteKit
  module Eureka
    ProblemTopicIndex = Data.define(:topics, :problems)

    class ProblemTopicBuilder
      def initialize(problem_records:, topics:, categories:, template_guide:)
        @problem_records = problem_records
        @topics = topics
        @categories = categories
        @template_guide = template_guide
      end

      def build
        validate_problem_categories!

        problem_titles = problem_records.to_h do |problem|
          [problem.fetch('problem_slug'), problem.fetch('title')]
        end
        topic_problem_slugs = topics.transform_values { [] }

        problems = problem_records.to_h do |problem|
          topic_ids = matching_topic_ids(problem.fetch('categories'))
          topic_ids.each { |topic_id| topic_problem_slugs.fetch(topic_id) << problem.fetch('problem_slug') }

          [problem.fetch('problem_slug'), problem_record(problem.fetch('categories'), topic_ids)]
        end

        SiteKit::Eureka::ProblemTopicIndex.new(
          topics: topics.transform_values do |topic|
            problem_slugs = topic_problem_slugs.fetch(topic.fetch('id'))
            topic.merge(
              'problems' => problem_slugs.map do |problem_slug|
                { 'slug' => problem_slug, 'title' => problem_titles.fetch(problem_slug, problem_slug) }
              end
            )
          end,
          problems: problems
        )
      end

      private

      attr_reader :problem_records, :topics, :categories, :template_guide

      def topic_presenter
        @topic_presenter ||= SiteKit::Templates::TopicPresenter.new
      end

      def validate_problem_categories!
        unknown_categories = problem_records.flat_map { |problem| problem.fetch('categories') }.uniq - categories.keys
        return if unknown_categories.empty?

        raise SiteKit::CatalogError,
              "Eureka problem categories are not mapped to local topics: #{unknown_categories.sort.join(', ')}"
      end

      def problem_record(category_labels, topic_ids)
        {
          'topic_ids' => topic_ids,
          'topics' => topic_ids.map { |topic_id| topic_presenter.topic_reference(topics.fetch(topic_id)) },
          'template_references' => template_reference_resolver.references_for_categories(category_labels),
          'categories' => category_labels.map { |category| category_record(category, topic_ids) }
        }
      end

      def matching_topic_ids(category_labels)
        topics
          .values
          .select { |topic| topic_matches_problem?(topic, category_labels) }
          .sort_by { |topic| sort_key(topic) }
          .map { |topic| topic.fetch('id') }
      end

      def topic_matches_problem?(topic, category_labels)
        SiteKit::Templates::ProblemRules.match_any?(topic.fetch('problem_rules', []), category_labels)
      end

      def category_record(category, problem_topic_ids)
        category_topics = categories.fetch(category, { 'topic_ids' => [], 'topics' => [] })
        category_topic_ids = category_topics.fetch('topic_ids') & problem_topic_ids
        category_topic_records = category_topic_ids.map do |topic_id|
          topic_presenter.topic_reference(topics.fetch(topic_id))
        end

        {
          'label' => category,
          'topic_ids' => category_topic_ids,
          'topics' => category_topic_records,
          'primary_topic_id' => primary_id(category_topic_ids)
        }
      end

      def template_reference_resolver
        @template_reference_resolver ||= SiteKit::Templates::Guide::ReferenceResolver.new(guide: template_guide)
      end

      def primary_id(ids)
        ids.size == 1 ? ids.first : ''
      end

      def sort_key(topic)
        topic_presenter.sort_key(topic)
      end
    end
  end
end
