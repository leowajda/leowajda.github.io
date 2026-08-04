# frozen_string_literal: true

module SiteKit
  module Eureka
    # Builds topic index + per-problem template references (single module).
    module Topics # rubocop:disable Metrics/ModuleLength
      module_function

      TOPIC_REFERENCE_KEYS = %w[id label description template_id kind order priority].freeze

      def record(project_slug:, topics:, templates:, template_guide:, flowchart_titles:, problem_records:)
        topic_index = build_topic_index(topics:, templates:, flowchart_titles:)
        problem_index = build_problem_index(
          problem_records:,
          topics: topic_index.fetch('topics'),
          categories: topic_index.fetch('categories'),
          template_guide:
        )

        {
          'project_slug' => project_slug,
          'topics' => problem_index.fetch('topics'),
          'categories' => topic_index.fetch('categories'),
          'flowchart_nodes' => template_guide.fetch('flowchart_nodes'),
          'problems' => problem_index.fetch('problems'),
          'templates' => topic_index.fetch('templates')
        }
      end

      def build_topic_index(topics:, templates:, flowchart_titles:)
        topic_records = {}
        categories = {}
        flowchart_nodes = {}
        template_index = templates.to_h { |template| [template.template_id, template] }

        topics.each do |topic|
          topic_records[topic.id] = topic_record(topic, flowchart_titles)
          category_labels(topic).each { |category| add_ref(categories, category, topic.id) }
          next unless topic.template?

          template_index.fetch(topic.template_id) do
            raise SiteKit::CatalogError,
                  "Algorithmic topic '#{topic.id}' references missing template '#{topic.template_id}'"
          end
          topic.flowchart_nodes.each { |node_id| add_ref(flowchart_nodes, node_id, topic.id) }
        end

        {
          'topics' => topic_records,
          'categories' => finalize_category_index(categories, topic_records),
          'flowchart_nodes' => finalize_flowchart_index(flowchart_nodes, topic_records),
          'templates' => template_records(topic_records)
        }
      end

      def build_problem_index(problem_records:, topics:, categories:, template_guide:)
        unknown = problem_records.flat_map { |problem| problem.fetch('categories') }.uniq - categories.keys
        unless unknown.empty?
          raise SiteKit::CatalogError,
                "Eureka problem categories are not mapped to local topics: #{unknown.sort.join(', ')}"
        end

        resolver = SiteKit::Templates::Guide::ReferenceResolver.new(guide: template_guide)
        titles = problem_records.to_h { |problem| [problem.fetch('problem_slug'), problem.fetch('title')] }
        topic_problem_slugs = topics.transform_values { [] }

        problems = problem_records.to_h do |problem|
          labels = problem.fetch('categories')
          topic_ids = matching_topic_ids(topics, labels)
          topic_ids.each { |topic_id| topic_problem_slugs.fetch(topic_id) << problem.fetch('problem_slug') }
          entry = problem_topic_entry(labels, topic_ids, categories, topics, resolver)

          [problem.fetch('problem_slug'), entry]
        end

        {
          'topics' => topics.transform_values do |topic|
            slugs = topic_problem_slugs.fetch(topic.fetch('id'))
            topic.merge(
              'problems' => slugs.map { |slug| { 'slug' => slug, 'title' => titles.fetch(slug, slug) } }
            )
          end,
          'problems' => problems
        }
      end

      def problem_topic_entry(labels, topic_ids, categories, topics, resolver)
        {
          'topic_ids' => topic_ids,
          'topics' => topic_ids.map { |id| topic_reference(topics.fetch(id)) },
          'template_references' => resolver.references_for_categories(labels),
          'categories' => labels.map do |category|
            category_record(category, topic_ids, categories, topics)
          end
        }
      end

      def topic_record(topic, flowchart_titles)
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
        rule_labels = topic.problem_rules.flat_map { |rule| rule.fetch('all', []) + rule.fetch('any', []) }
        (topic.aliases + rule_labels).uniq
      end

      def add_ref(index, key, topic_id)
        index[key] ||= []
        index[key] |= [topic_id]
      end

      def sort_topic_ids(topic_ids, topics)
        topic_ids.sort_by do |topic_id|
          topic = topics.fetch(topic_id)
          [topic.fetch('priority'), topic.fetch('order'), topic.fetch('label').downcase]
        end
      end

      def topic_reference(topic)
        TOPIC_REFERENCE_KEYS.to_h { |key| [key, topic.fetch(key)] }
      end

      def template_id(topic)
        topic.fetch('template_id', '')
      end

      def present_template_id(topic)
        value = template_id(topic)
        value unless value.empty?
      end

      def template_reference(topic)
        topic_template_id = template_id(topic)
        return nil if topic_template_id.empty?

        topic_reference(topic).merge('id' => topic_template_id, 'topic_id' => topic.fetch('id'))
      end

      def finalize_category_index(index, topics)
        index.transform_values do |topic_ids|
          sorted = sort_topic_ids(topic_ids, topics)
          {
            'topic_ids' => sorted,
            'topics' => sorted.map { |id| topic_reference(topics.fetch(id)) },
            'template_ids' => sorted.filter_map { |id| present_template_id(topics.fetch(id)) }
          }
        end
      end

      def finalize_flowchart_index(index, topics)
        index.transform_values do |topic_ids|
          sorted = sort_topic_ids(topic_ids, topics)
          {
            'topic_ids' => sorted,
            'topics' => sorted.filter_map { |id| template_reference(topics.fetch(id)) },
            'template_ids' => sorted.filter_map { |id| present_template_id(topics.fetch(id)) }
          }
        end
      end

      def template_records(topics)
        topics.values
              .filter_map { |topic| template_reference(topic) }
              .to_h { |topic| [topic.fetch('id'), topic] }
      end

      def matching_topic_ids(topics, category_labels)
        topics.values
              .select do |topic|
                SiteKit::Templates::ProblemRules.match_any?(topic.fetch('problem_rules', []), category_labels)
              end
              .sort_by { |topic| [topic.fetch('priority'), topic.fetch('order'), topic.fetch('label').downcase] }
              .map { |topic| topic.fetch('id') }
      end

      def category_record(category, problem_topic_ids, categories, topics)
        cat = categories.fetch(category, { 'topic_ids' => [], 'topics' => [] })
        ids = cat.fetch('topic_ids') & problem_topic_ids
        {
          'label' => category,
          'topic_ids' => ids,
          'topics' => ids.map { |id| topic_reference(topics.fetch(id)) },
          'primary_topic_id' => ids.size == 1 ? ids.first : ''
        }
      end
    end
  end
end
